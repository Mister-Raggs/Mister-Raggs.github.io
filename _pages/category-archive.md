---
title: "Posts by Category"
permalink: /categories/
author_profile: true
layout: page
---

{% assign categories = site.categories | sort %}
{% if categories and categories.size > 0 %}
{% for category in categories %}
## {{ category[0] }} ({{ category[1].size }})

{% for post in category[1] %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.date | date: "%b %-d, %Y" }}
{% endfor %}

{% endfor %}
{% else %}
No categories yet.
{% endif %}
