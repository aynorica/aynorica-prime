# Recon Automation Workflow for Bug Bounty

This guide outlines a comprehensive reconnaissance automation workflow designed for bug bounty hunting. It covers asset discovery, probing, scanning, content discovery, and data organization.

## 1. Asset Discovery

The goal is to expand the attack surface by finding as many valid subdomains and IP ranges as possible.

### Subdomain Enumeration
Combine passive and active sources for maximum coverage.

*   **Subfinder**: Fast, passive enumeration.
    ```bash
    subfinder -d target.com -all -o subdomains_passive.txt
    ```
*   **Amass**: Comprehensive enumeration (passive + active).
    ```bash
    amass enum -passive -d target.com -o amass_passive.txt
    # Active mode (careful with rate limits)
    amass enum -active -d target.com -brute -o amass_active.txt
    ```
*   **Merging & Sorting**:
    ```bash
    cat subdomains_passive.txt amass_passive.txt | sort -u > all_subdomains.txt
    ```

### ASN/CIDR Mapping
Identify the infrastructure ownership to find non-domain assets.

*   **Amass Intel**:
    ```bash
    amass intel -org "Target Name"
    ```
*   **BGPView / Hurricane Electric**: Manual lookup of ASN to find IP ranges (CIDRs).
*   **Map CIDRs to IPs**:
    ```bash
    prips 192.168.1.0/24 > ips.txt
    ```

## 2. HTTP Probing

Filter the list of domains/IPs to identify live web services and understand their technology stack.

### Filtering Live Hosts
Use **httpx** to probe for running HTTP services on standard and non-standard ports.

```bash
httpx -l all_subdomains.txt -ports 80,443,8000,8080,8443 -title -tech-detect -status-code -o live_hosts.txt
```

### Tech Stack Detection
Identify the technologies used (CMS, Frameworks, Servers) to tailor downstream attacks.

*   **httpx** (built-in): The `-tech-detect` flag in the command above provides this.
*   **Wappalyzer** (CLI or Extension): Can be scripted for deeper analysis.
*   **WhatWeb**:
    ```bash
    whatweb -i live_hosts.txt --log-json=tech_stack.json
    ```

## 3. Vulnerability Scanning

Automated scanning for known vulnerabilities and misconfigurations.

### Nuclei Templates
The core of modern automation.

*   **Basic Scan (Low False Positives)**:
    ```bash
    nuclei -l live_hosts.txt -t http/cves/ -t http/misconfiguration/ -o nuclei_results.txt
    ```
*   **Exposure Scanning**:
    ```bash
    nuclei -l live_hosts.txt -t http/exposures/ -t http/token-spray/
    ```

### Passive vs. Active Scanning
*   **Passive**: Analyzing response headers, missing security flags, information disclosure (e.g., `nuclei -t http/misconfiguration/response/`). Safe to run frequently.
*   **Active**: Sending payloads that might trigger WAFs or cause side effects (e.g., SQLi, RCE templates). Run selectively on interesting targets.

## 4. Content Discovery

Finding hidden files, directories, and parameters that aren't linked.

### Fuzzing (ffuf)
Directory and file brute-forcing.

```bash
ffuf -w /path/to/wordlist.txt -u https://target.com/FUZZ -mc 200,301,302,403 -o ffuf_results.json
```
*   **Recursion**: Use `-recursion` to dive into discovered directories.
*   **Extensions**: Use `-e .php,.html,.js,.json` to find specific file types.

### Parameter Discovery
Finding hidden parameters for GET/POST requests.

*   **Arjun**:
    ```bash
    arjun -u https://target.com/endpoint -w /path/to/param_wordlist.txt
    ```
*   **x8**: A fast parameter discovery tool written in Rust.

## 5. Organization & Diffing

Managing data is crucial for long-term success.

### Directory Structure
Organize by program and date.

```text
/bounty/
  /program-name/
    /2023-10-27/
      subdomains.txt
      live_hosts.txt
      nuclei_results.txt
    /2023-10-28/
      ...
```

### Diffing Scans
Detect new assets or changes in existing ones. This is where many bugs are found.

*   **Anew**: A tool by tomnomnom to append lines from stdin to a file, but only if they don't already appear in the file.
    ```bash
    # On Day 2
    cat new_subdomains.txt | anew old_subdomains.txt > newly_discovered.txt
    ```
*   **Notify**: Pipe the output of `anew` to a notification tool (Slack/Discord/Telegram) to get real-time alerts on new assets.
    ```bash
    cat newly_discovered.txt | notify -config config.yaml
    ```

### Automation Scripts
Wrap these steps in a bash script or a workflow engine (like Axiom for distributed scanning) to run periodically (e.g., daily or weekly).
