# tag-replay
1. Download the filtered.log file from your reader using WinSCP
2. Set up a "replay" tag source in your timing software. IP address should be `127.0.0.1` and port should be `11111`
3. Copy the path of the filtered.log file by `shift`+`right-click` and selecting `copy as path`
4. Run tag-replay-win.exe. You will be prompted for the data you need to enter. Enter port `11111`, time and date as necessary, and the tags will be replayed into your timing system.
