---
title: "Posts by Tag"
permalink: /tags/
author_profile: true
layout: page
---

{% assign tags = site.tags | sort %}
{% if tags and tags.size > 0 %}
{% for tag in tags %}
## {{ tag[0] }} ({{ tag[1].size }})

{% for post in tag[1] %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.date | date: "%b %-d, %Y" }}
{% endfor %}

{% endfor %}
{% else %}
No tags yet.
{% endif %}
