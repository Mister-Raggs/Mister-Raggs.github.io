---
layout: list
title: Projects
description: A showcase of my work and projects
---

## Featured Projects

{% for project in site.projects %}
### [{{ project.title }}]({{ project.url }})

{{ project.description }}

{% if project.links %}
**Links:**
{% for link in project.links %}
- [{{ link.title }}]({{ link.url }})
{% endfor %}
{% endif %}

---
{% endfor %}
