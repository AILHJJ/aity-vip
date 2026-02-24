  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0*   Trying 124.221.119.134:8443...
* Connected to aity88.online (124.221.119.134) port 8443 (#0)
* ALPN: offers h2
* ALPN: offers http/1.1
*  CAfile: C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt
*  CApath: none
} [5 bytes data]
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
} [512 bytes data]
* TLSv1.3 (IN), TLS handshake, Server hello (2):
{ [122 bytes data]
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
{ [19 bytes data]
* TLSv1.3 (IN), TLS handshake, Certificate (11):
{ [3225 bytes data]
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
{ [264 bytes data]
* TLSv1.3 (IN), TLS handshake, Finished (20):
{ [52 bytes data]
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.3 (OUT), TLS handshake, Finished (20):
} [52 bytes data]
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=aity88.online
*  start date: Jan 26 00:00:00 2026 GMT
*  expire date: Apr 25 23:59:59 2026 GMT
*  subjectAltName: host "aity88.online" matched cert's "aity88.online"
*  issuer: C=CN; O=TrustAsia Technologies, Inc.; CN=TrustAsia DV TLS RSA CA 2025
*  SSL certificate verify ok.
* Using HTTP2, server supports multiplexing
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
} [5 bytes data]
* h2h3 [:method: POST]
* h2h3 [:path: /api/messages/57/read]
* h2h3 [:scheme: https]
* h2h3 [:authority: aity88.online:8443]
* h2h3 [user-agent: curl/7.83.1]
* h2h3 [accept: */*]
* h2h3 [authorization: Bearer ]
* Using Stream ID: 1 (easy handle 0x1edc0ea2140)
} [5 bytes data]
> POST /api/messages/57/read HTTP/2
> Host: aity88.online:8443
> user-agent: curl/7.83.1
> accept: */*
> authorization: Bearer 
> 
{ [5 bytes data]
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
{ [265 bytes data]
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
{ [265 bytes data]
* old SSL session ID is stale, removing
{ [5 bytes data]
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
} [5 bytes data]
< HTTP/2 404 
< server: nginx
< date: Thu, 05 Feb 2026 11:33:08 GMT
< content-type: application/json; charset=utf-8
< content-length: 23
< vary: Origin
< access-control-allow-credentials: true
< content-security-policy: default-src 'self';script-src 'self' 'unsafe-inline' 'unsafe-eval';style-src 'self' 'unsafe-inline';img-src 'self' data: https:;font-src 'self' data:;connect-src 'self' https:;frame-ancestors 'none';base-uri 'self';form-action 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
< cross-origin-opener-policy: same-origin
< cross-origin-resource-policy: same-origin
< origin-agent-cluster: ?1
< referrer-policy: strict-origin-when-cross-origin
< strict-transport-security: max-age=31536000; includeSubDomains; preload
< x-content-type-options: nosniff
< x-dns-prefetch-control: off
< x-download-options: noopen
< x-frame-options: DENY
< x-permitted-cross-domain-policies: none
< x-xss-protection: 0
< etag: W/"17-JG2JTE6to/D4sxc2pRx7Kk+opAc"
< 
{ [23 bytes data]
100    23  100    23    0     0    130      0 --:--:-- --:--:-- --:--:--   131{"message":"Not found"}
* Connection #0 to host aity88.online left intact
*   Trying 0.0.0.2:80...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* connect to 0.0.0.2 port 80 failed: Network unreachable
* Failed to connect to 0.0.0.2 port 80 after 0 ms: Network unreachable
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
* Closing connection 1
curl: (7) Failed to connect to 0.0.0.2 port 80 after 0 ms: Network unreachable
