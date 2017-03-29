# gweax' blog

{% for post in site.posts %}
- [{{ post.url }}]({{ post.title }})
{% endfor %}
