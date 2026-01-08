---
layout: page
title: Blog
permalink: /blog/
---

{% assign posts = site.posts %}
{% if posts and posts.size > 0 %}
{% for post in posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.date | date: "%b %-d, %Y" }}
	{% if post.excerpt %}{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}{% endif %}
{% endfor %}
{% else %}
No posts yet.
{% endif %}
