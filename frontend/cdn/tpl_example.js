fetch("api/lipstick")
  .then(body => body.json())
  .then(async (lipstick) => {
    let el_lipstick = await applyLipstickTemplate(lipstick);
    $("body").html($("body").html() + el_lipstick);
  });

async function applyLipstickTemplate(lipstick) {
  // console.log(`processing ${data.type} with name '${data.name}' and details '${data.details}'`);
  
  let template = await getTemplate(lipstick.type);

  return apply(template, lipstick.name, lipstick.details);

}
