# Arma el mensaje del webhook para un push (entrada: el evento push de GitHub) y $avatar.
# Agrupa por el prefijo del commit (feat, fix y el resto) y oculta los merges.
# shortcut: GitHub manda como mucho 20 commits por push en el evento; si un push trae más, faltan en la lista (el enlace de comparación los muestra todos).
def kind: ((capture("^(?<t>[a-z]+)(\\([^)]*\\))?!?:") | .t) // "");
def headline: split("\n")[0] | sub("^[a-z]+(\\([^)]*\\))?!?:\\s*"; "");
def line: "[`\(.id[0:7])`](\(.url)) \(.message | headline)";
def plural($n; $one; $many): if $n == 1 then "\($n) \($one)" else "\($n) \($many)" end;
def section($commits; $name; f): [$commits[] | select(f)] as $c
  | if ($c | length) > 0 then "**\($name)**\n" + ([$c[] | line] | join("\n")) else empty end;

(.ref | sub("^refs/heads/"; "")) as $branch
| .compare as $compare
| [.commits[] | select(.message | startswith("Merge ") | not)] as $real
| [.commits[] | select(.message | startswith("Merge "))] as $merges
| [$merges[].message | capture("^Merge pull request #(?<n>[0-9]+)").n] as $prs
| ([
    section($real; "✨ Novedades"; (.message | kind) == "feat"),
    section($real; "🐛 Arreglos"; (.message | kind) == "fix"),
    section($real; "🧹 Mantenimiento"; (.message | kind) as $k | $k != "feat" and $k != "fix")
  ] | join("\n\n")) as $list
| ((if ($merges | length) > 0 then plural($merges | length; "merge oculto"; "merges ocultos") + " · " else "" end)
    + "[Ver todos los cambios](\($compare))") as $more
| {
    username: "Araña Sound",
    embeds: [{
      author: { name: .sender.login, icon_url: .sender.avatar_url, url: .sender.html_url },
      title: ("\($branch): " + plural($real | length; "commit nuevo"; "commits nuevos")
        + (if ($prs | length) > 0 then " (PR " + ($prs | map("#" + .) | join(", ")) + ")" else "" end)),
      url: $compare,
      # Discord: 4096 caracteres por descripción
      description: ((if ($list | length) > 3800 then $list[0:3800] + "…" else $list end) + "\n\n" + $more),
      color: (if $branch == "main" then 1947988 elif $branch == "Development" then 5793266 else 8947584 end),
      # Las listas de archivos no siempre vienen en el evento (en Actions llegan vacías): sin ellas no se cuenta
      footer: { text: "\(.repository.full_name) · \($branch)"
        + ([.commits[] | ((.added // []) + (.removed // []) + (.modified // []))[]] | unique | length
           | if . > 0 then " · " + plural(.; "archivo cambiado"; "archivos cambiados") else "" end) },
      timestamp: .head_commit.timestamp
    }]
  }
| if $avatar != "" then . + { avatar_url: $avatar } else . end
