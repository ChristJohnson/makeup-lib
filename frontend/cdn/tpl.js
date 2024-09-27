const TEMPLATE_REGEX = /\$(?<=\}?.*)\{[^\$]*(?=.*\$?)\}/g;

async function getTemplate(template) {
  const response = await fetch(`tpl/${template}`);

  if (response.ok) {
    let template = await response.text();
    let rawTemplate = {
      string: template,
      tokens: template.match(TEMPLATE_REGEX),
      raw: template.split(TEMPLATE_REGEX),
      toString: function() {
        return template;
      }
    };
    
    return rawTemplate;
  }

  throw new Error(`template with name "${template}" not found`);
}

function apply({ raw: templateStrings }, ...args) {
  let s = templateStrings[0];

  for(let i = 0; i < args.length; i++) {
    s += templateStrings[i];
    
    let arg = String(args[i]);

    s += arg
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return s;
}
