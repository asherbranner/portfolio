# Recovered 2023 site media — do not delete, do not reference in the 2026 design.

The 2023 .gitignore had `/public/images/` and `/public/videos/`, so the site's
media NEVER lived in git, on laces-linux, or in the vault. When those working
copies went away the media was gone. What survived was recovered on 2026-11-15:

| file | source of recovery |
|---|---|
| project1.jpg … project4.jpg | git history, blobs from commit ddadc1f (Initial Commit), deleted in 4e7aad9 |
| contact.png, eng.png, software.png, online.png, github.png, linkedin.png | Wayback Machine captures, May 2023 (web.archive.org) |
| resume 2023 | already lived in git at public/Noah-Asherbranner-Resume.pdf |

Everything else referenced by the 2023 templates (projects/*.png photos,
logos/lang + logos/programs brand images, pipetool/roboarm/tellodrone .mp4
videos, the blog/comingsoon/wdws tile icons) was archived nowhere and is
gone for good. The 2026 design ships zero photo-dependent layout for that
reason — and the .gitignore no longer excludes media.
