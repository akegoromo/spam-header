Delivered-To: silver.firefox+whither-jp@gmail.com
Received: by 2002:a98:a155:0:b0:25f:c202:d360 with SMTP id k21csp90896eic;
        Sat, 21 Mar 2026 02:25:59 -0700 (PDT)
X-Forwarded-Encrypted: i=3; AJvYcCWjZqt6oAWkRhlTwE3R0PQi+CLggOpOq52Ox5KtvaLRd0eKuRpLvhjsxxkqa6i6pI3JRKzZu6v8p4QLdGPZyQ==@gmail.com
X-Received: by 2002:a17:902:f70e:b0:2ae:5104:571e with SMTP id d9443c01a7336-2b0826d6e37mr53737005ad.9.1774085158806;
        Sat, 21 Mar 2026 02:25:58 -0700 (PDT)
ARC-Seal: i=2; a=rsa-sha256; t=1774085158; cv=pass;
        d=google.com; s=arc-20240605;
        b=ieb5T+0HEL2fB7Ysq+Np/st1c9EM0hCuBHm1cAo56UYZUNIlmo15o0uTudMjijPqeM
         IO2/DgViUYPioSyS6BlOOW0aE16z6nlFufX2mIYChsdnc9hQXsVQmIR7mIGG/v0wrmTT
         H7g7afoo83aHw+zSOEg9+Lyw7WyPPvYaSHmejWuppxDNwHWeRBpTGTYYuuIVXsUwmspa
         S0GFkBiFkSwU/8pZToCUxqRCwdPMZ5kA2ymeANq8KS1pH1MlfRKMoc3dB7h0wGaGah9E
         oV6iC4jMKKlUzt97vQZs58shvgovUWjNIydiz3/jEmHo5/DoSDrGg5IZpkQ4SGKyFFw8
         9lGg==
ARC-Message-Signature: i=2; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605;
        h=track_id:content-transfer-encoding:mime-version:date:subject:to
         :from:message-id:feedback-id:dkim-signature:dkim-signature;
        bh=+Cr5MLDxv4dlnlTrlHiZyRId3R5YSfV8CZfjHwVJ04M=;
        fh=ENXOhFKW7CT4pn4Lz1vO6o5YQQdiV/Ih3E4yEdfzxpY=;
        b=AsFduz4Ai5qhoMrXIjojj94WdJO2Fv/z4Pj+s3lTNgPtC2g/n358YpUsRZ58+RvC4g
         Po+CAA4e2YmLsuhWjxvLjuvxd7TJfAJ4L8Zuv8IYcZn9bEf1vdvGxKuKjVSEne6Zv0z/
         IBamEFxgvfZSRmLl6eNrdEfqXdE2WfHzZW96r2+4i+fDkHfNlTbykAhnE7y66BZcA2Zg
         vhyFHXdIEK9tzTgeZDHjkzVbEEjj0ARfcEEEgnt3cJZKmN4so6AK5vXeyIDFNc7vOdOa
         1r3NZThrF9dKA/qzkk+yBDdyYqLAO9kLORtygrXqZGlDRhxxFFBnZ/Bc16aClBevP3zr
         J0QQ==;
        dara=google.com
ARC-Authentication-Results: i=2; mx.google.com;
       dkim=pass header.i=@cloudflare-email.net header.s=cf2024-1 header.b=RwmJ48+K;
       dkim=pass header.i=@whither.jp header.s=cf2024-1 header.b=NI+pslAC;
       arc=pass (i=1 spf=pass spfdomain=deadsett.com);
       spf=pass (google.com: domain of srs0=zpcd=vb=deadsett.com=help@whither.jp designates 104.30.8.99 as permitted sender) smtp.mailfrom="SRS0=zpcd=vb=deadsett.com=help@whither.jp"
Return-Path: <SRS0=zpcd=vb=deadsett.com=help@whither.jp>
Received: from i-jj.cloudflare-email.net (i-jj.cloudflare-email.net. [104.30.8.99])
        by mx.google.com with ESMTPS id d9443c01a7336-2b0836c273csi68217355ad.193.2026.03.21.02.25.57
        for <silver.firefox+whither-jp@gmail.com>
        (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256 bits=128/128);
        Sat, 21 Mar 2026 02:25:58 -0700 (PDT)
Received-SPF: pass (google.com: domain of srs0=zpcd=vb=deadsett.com=help@whither.jp designates 104.30.8.99 as permitted sender) client-ip=104.30.8.99;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@cloudflare-email.net header.s=cf2024-1 header.b=RwmJ48+K;
       dkim=pass header.i=@whither.jp header.s=cf2024-1 header.b=NI+pslAC;
       arc=pass (i=1 spf=pass spfdomain=deadsett.com);
       spf=pass (google.com: domain of srs0=zpcd=vb=deadsett.com=help@whither.jp designates 104.30.8.99 as permitted sender) smtp.mailfrom="SRS0=zpcd=vb=deadsett.com=help@whither.jp"
DKIM-Signature: v=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; c=relaxed/relaxed; h=Date:Subject:To:From:Feedback-ID:reply-to:cc:resent-date:resent-from :resent-to:resent-cc:in-reply-to:references:list-id:list-help :list-unsubscribe:list-unsubscribe-post:list-subscribe:list-post :list-owner:list-archive; t=1774085158; x=1774689958; bh=+Cr5MLDxv4dlnlTrlH iZyRId3R5YSfV8CZfjHwVJ04M=; b=RwmJ48+K1o9blK0FtytMmEete5c/sRJ1+5dMYTybzqm/K UsedWBtyschoSWobsqM4iIVPF7mJYTBMvu9hdQD0IHkjvgvmufZJTPk/aksQSQgmJ10whfM3Uvt orx75jEOsPAn4o/psNaWYcWCx9+Q9eDhnfl+EA9CgxkwPVCxePwDaQIz8vGf1eZ/uY0ZBdKEucc 51XGdeld50+KhweqenxL37nEb5d8KKaWq6jP5APaFzArC2AT9xXERmaK8msKM415wugTXC8IWAl v7qfGHDXpME2LPX6AYdTDt3Zn7pTpfnPxJ6DugZPEAbUoHVq3u9COIjodfslL02l3/GvuZHw==;
DKIM-Signature: v=1; a=rsa-sha256; s=cf2024-1; d=whither.jp; c=relaxed/relaxed; h=Date:Subject:To:From:Feedback-ID:reply-to:cc:resent-date:resent-from :resent-to:resent-cc:in-reply-to:references:list-id:list-help :list-unsubscribe:list-unsubscribe-post:list-subscribe:list-post :list-owner:list-archive; t=1774085158; x=1774689958; bh=+Cr5MLDxv4dlnlTrlH iZyRId3R5YSfV8CZfjHwVJ04M=; b=NI+pslAC7ETdD6cfz/6oFRwp1j0TPovSNl97vq4ezEJep HX9FlNAwR90nJ+EiwPk4JpPDyVOhrYdsSgZylr1kajZIXPT/rY7ccmc+YqHjb3eA8mqdM2z9GHa 0EM7VpUQB6Lrb5vQW1nxNnQHT5FUY+hU2QR0bUWg0ijSy04Rs/BPofxSKcviJpybAzgsVPPK975 rTUaccW4FHMAjRcirNIiF4x0ombKutgAp9LUT/kQrcXtkYIG9AwiWZ5C7MXPvF1yQwpze6SODef OeioqRVAxqBt32N+OU5hwrfxBKf7p3yjtLmOaqTXyvPz8mtXGYBNPoH1khtuZp9TAkdCjjLw==;
X-Forwarded-To: silver.firefox+whither-jp@gmail.com
X-Forwarded-For: penguin@whither.jp silver.firefox+whither-jp@gmail.com
Feedback-ID: whither.jp:1:1:Cloudflare
Received: from deadsett.com (34.85.88.131)
        by cloudflare-email.net (cloudflare) id rmdZxgj6Zsw4
        for <penguin@whither.jp>; Sat, 21 Mar 2026 09:25:54 +0000
ARC-Seal: i=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; cv=none; b=U6yKU7HC8bW/eUBXbn2/liQ7RgGn4z2hUkpZ0gFlg1c9PpxP7cKLsmEJhpgAXXHX/FbM+slpR /8UuSorQrBXmAEA2seUqPIL2vrUfT55EDdFeH1Th0ffX6K0C54sl9EPeZn67X3YMmhTPlBjF6dj VhrYF/unOg9tgLA+BRgJhzzMTypaX8ib/Fgi7eW0FG3kqfCraNdAw3lpUegZ++wqH7XSXB48iXF CS3XL9Get/YhVXOHh4+6yYJOikgcy1j84dYUFhxNZf7+meZpIHWggBU+rzNnJpE8IdkUyq1T6fr xxUrze4hfx68xVHK0l23qxPHw21kWAV/bdypR7XmvypQ==;
ARC-Message-Signature: i=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; c=relaxed/relaxed; h=Date:Subject:To:From:reply-to:cc:resent-date:resent-from:resent-to :resent-cc:in-reply-to:references:list-id:list-help:list-subscribe :list-post:list-owner:list-archive; t=1774085156; x=1774689956; bh=+Cr5MLDx v4dlnlTrlHiZyRId3R5YSfV8CZfjHwVJ04M=; b=dx0H0ESN5/3CRSDz69megYwUv+n2foNVidv DFOiQZIgfFBWhIRskWiPQC38DvmKx7N7BU+itP/55S7rtELrinLh+MT9Rs0X8ck035aoeLZN6ov MEvtvCZyNymJOgroKmjxOrawoPcGThYyKn7FFNDbA1l7K3XpAavb1cQ6o3ehrt9n3oDwwd11XpG attoEDvs2Nh/E3rBb/ZEZ9gYk+98WYlLnTwytpFioBpth0+PizDTyvmcLXzH0pDNlnZvlmfxlFo uhIaKeiOJDxkcJcRL0g1cpH5raYnR/Nboo6MfIjqI0SOl7aOxfGgxT0287re0DDG3Ync2BPbdZM PvcgTBg==;
ARC-Authentication-Results: i=1; mx.cloudflare.net; dmarc=none header.from=mercari.co.jp policy.dmarc=none; spf=pass (mx.cloudflare.net: domain of postmaster@deadsett.com designates 34.85.88.131 as permitted sender) smtp.helo=deadsett.com; spf=pass (mx.cloudflare.net: domain of help@deadsett.com designates 34.85.88.131 as permitted sender) smtp.mailfrom=help@deadsett.com; arc=none smtp.remote-ip=34.85.88.131
Received-SPF: pass (mx.cloudflare.net: domain of help@deadsett.com designates 34.85.88.131 as permitted sender) receiver=mx.cloudflare.net; client-ip=34.85.88.131; envelope-from="help@deadsett.com"; helo=deadsett.com;
Authentication-Results: mx.cloudflare.net; dmarc=none header.from=mercari.co.jp policy.dmarc=none; spf=pass (mx.cloudflare.net: domain of postmaster@deadsett.com designates 34.85.88.131 as permitted sender) smtp.helo=deadsett.com; spf=pass (mx.cloudflare.net: domain of help@deadsett.com designates 34.85.88.131 as permitted sender) smtp.mailfrom=help@deadsett.com; arc=none smtp.remote-ip=34.85.88.131
X-CF-SpamH-Score: 1
Message-ID: <I7sQv@deadsett.com>
From: "メルカリ運営事務局" <server@mercari.co.jp>
To: <penguin@whither.jp>
Subject: 【要対応】お支払い方法の更新について（カード有効期限切れ）No.8760434363
Date: Sat, 21 Mar 2026 17:25:53 +0800
