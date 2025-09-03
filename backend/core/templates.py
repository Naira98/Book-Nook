from jinja2 import Environment, FileSystemLoader, select_autoescape
import os

templates_dir = os.path.join(os.path.dirname(__file__), "..", "templates")

jinja_env = Environment(
    loader=FileSystemLoader(templates_dir),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_template(template_name: str, **kwargs) -> str:
    template = jinja_env.get_template(template_name)
    return template.render(**kwargs)
