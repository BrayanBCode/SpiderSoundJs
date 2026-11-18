# Arma el mensaje del webhook a partir del release (entrada) y de $prev, $repo y $avatar.
# Discord: 4096 caracteres por descripción de embed; las notas largas se cortan con un enlace al release.
(.body // "") as $notes
| {
    username: "Araña Sound",
    embeds: [{
      author: { name: .author.login, icon_url: .author.avatar_url, url: .author.html_url },
      title: "🕷️ Nueva versión: Araña Sound \(.tag_name)",
      url: .html_url,
      description: (if ($notes | length) > 3900
        then $notes[0:3900] + "…\n\n[Ver todas las notas →](\(.html_url))"
        else $notes end),
      color: 1947988,
      fields: (
        [{ name: "Versión", value: .tag_name, inline: true }]
        + (if $prev != "" then [
            { name: "Anterior", value: $prev, inline: true },
            { name: "Cambios", value: "[Ver comparación](https://github.com/\($repo)/compare/\($prev)...\(.tag_name))", inline: true }
          ] else [] end)
      ),
      footer: { text: "\($repo) · release publicado" },
      timestamp: .published_at
    }]
  }
| if $avatar != "" then . + { avatar_url: $avatar } else . end
