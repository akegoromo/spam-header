#!/usr/bin/env python3
# scripts/extract_spam_headers.py

import re
import uuid
from pathlib import Path

# ディレクトリ設定
EML_DIR = Path("eml")
SPAM_DIR = Path("spam")
SPAM_DIR.mkdir(exist_ok=True)

def extract_headers_and_message_id(content: str) -> tuple[str, str]:
    """
    メール内容からヘッダ部分を抽出し、Message-IDを取得する
    
    抽出ルール:
    1. Date: 行までのヘッダを抽出
    2. Date: 到達時点でMessage-ID: が未出現なら Message-ID: 行まで延長
    3. 空行に到達したら強制終了
    
    Returns:
        tuple: (抽出したヘッダテキスト, message_id値)
    """
    lines = content.splitlines(keepends=True)
    header_lines = []
    found_date = False
    found_message_id = False
    message_id_value = ""
    
    for line in lines:
        # 空行はヘッダ終端（強制終了）
        if line.strip() == "":
            break
            
        header_lines.append(line)
        line_lower = line.lower()
        
        if line_lower.startswith("date:"):
            found_date = True
        elif line_lower.startswith("message-id:"):
            found_message_id = True
            message_id_value = extract_message_id_value(line)
        
        # Date と Message-ID 両方が見つかったら終了
        if found_date and found_message_id:
            break
    
    # Date は見つかったが Message-ID が未発見の場合、Message-ID まで延長
    if found_date and not found_message_id:
        remaining_lines = lines[len(header_lines):]
        for line in remaining_lines:
            if line.strip() == "":  # 空行で終了
                break
            header_lines.append(line)
            if line.lower().startswith("message-id:"):
                message_id_value = extract_message_id_value(line)
                break
    
    # Message-ID が最終的に見つからない場合
    if not message_id_value:
        message_id_value = f"missing-id-{uuid.uuid4().hex[:8]}"
    
    return "".join(header_lines), message_id_value

def extract_message_id_value(line: str) -> str:
    """Message-ID: ヘッダ行から実際のID値を抽出"""
    # コロン以降を取得
    _, _, value = line.partition(":")
    value = value.strip()
    
    # <...> で囲まれている場合は中身のみ取得
    match = re.search(r"<(.+?)>", value)
    if match:
        return match.group(1)
    
    return value

def sanitize_filename(message_id: str) -> str:
    """Message-IDをファイル名として安全な文字列に変換"""
    return re.sub(r'[<>:"/\\|?*]', "_", message_id)

def resolve_duplicate_filename(base_message_id: str) -> str:
    """
    重複しないファイル名を決定する
    
    重複時の処理:
    - @ が含まれる場合: @ の直前に _<連番> を挿入
    - @ が含まれない場合: 末尾に _<連番> を付与
    """
    base = sanitize_filename(base_message_id)
    candidate = f"{base}.txt"
    
    if not (SPAM_DIR / candidate).exists():
        return candidate
    
    # 重複対応
    if "@" in base:
        local_part, domain_part = base.rsplit("@", 1)
        counter = 1
        while True:
            candidate = f"{local_part}_{counter}@{domain_part}.txt"
            if not (SPAM_DIR / candidate).exists():
                return candidate
            counter += 1
    else:
        counter = 1
        while True:
            candidate = f"{base}_{counter}.txt"
            if not (SPAM_DIR / candidate).exists():
                return candidate
            counter += 1

def process_all_emails() -> tuple[int, int]:
    """
    eml/ ディレクトリ内の全.emlファイルを処理
    
    Returns:
        tuple: (処理成功件数, エラー件数)
    """
    processed_count = 0
    error_count = 0
    
    eml_files = sorted(EML_DIR.glob("*.eml"))
    
    if not eml_files:
        print("No .eml files found. Processing completed.")
        return 0, 0
    
    print(f"Found {len(eml_files)} .eml files to process.")
    
    for eml_file in eml_files:
        try:
            # エンコーディングのフォールバック処理
            try:
                content = eml_file.read_text(encoding="utf-8", errors="strict")
            except UnicodeDecodeError:
                print(f"  UTF-8 failed for {eml_file.name}, trying Latin-1...")
                content = eml_file.read_text(encoding="latin-1", errors="replace")
            
            # ヘッダ抽出
            header_text, message_id = extract_headers_and_message_id(content)
            
            # ファイル名決定（重複回避含む）
            filename = resolve_duplicate_filename(message_id)
            
            # ヘッダテキストを保存
            output_path = SPAM_DIR / filename
            output_path.write_text(header_text, encoding="utf-8")
            
            # 元の.emlファイルを削除
            eml_file.unlink()
            
            print(f"  ✓ {eml_file.name} → spam/{filename}")
            processed_count += 1
            
        except Exception as e:
            print(f"  ✗ Error processing {eml_file.name}: {e}")
            error_count += 1
    
    print(f"\nProcessing completed: {processed_count} processed, {error_count} errors")
    return processed_count, error_count

if __name__ == "__main__":
    print("=== Spam Header Extraction Start ===")
    process_all_emails()
    print("=== Extraction Complete ===")
