---
layout: list
title: Projects
description: A showcase of my work and projects
permalink: /projects/
---

## Featured Projects

{% assign sorted_projects = site.projects | sort: 'date' | reverse %}
{% for project in sorted_projects %}
### [{{ project.title }}]({{ project.url | relative_url }})

{{ project.description }}

{% if project.links %}
**Links:**
{% for link in project.links %}
- [{{ link.title }}]({{ link.url }})
{% endfor %}
{% endif %}

---
{% endfor %}
