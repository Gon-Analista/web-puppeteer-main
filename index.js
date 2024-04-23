import puppeteer from "puppeteer";

class Receta {
  constructor(titulo, imagen, url, recipeData, specialNeeds, nutritionalInfo, additionalInfo, recipeIngredients, recipeCategory, recipeInstructions) {
    this.titulo = titulo;
    this.imagen = imagen;
    this.url = url;
    this.recipeData = recipeData;
    this.specialNeeds = specialNeeds;
    this.nutritionalInfo = nutritionalInfo;
    this.additionalInfo = additionalInfo;
    this.recipeIngredients = recipeIngredients;
    this.recipeCategory = recipeCategory;
    this.recipeInstructions = recipeInstructions;
  }
}

async function getDataFromWebPage() {
  const browser = await puppeteer.launch({ headless: true, slowMo: 0 });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  });

  await page.goto("https://www.nestlecocina.es/receta/bocadillo-de-sensational-sausage");

  const data = await page.evaluate(() => {
    const title = document.querySelector("h1").innerText;
    const metaTagsImage = Array.from(document.querySelectorAll("meta[property='og:image']"));
    const imagen = metaTagsImage.length > 0 ? metaTagsImage[0].getAttribute("content") : null;
    const metaTagsUrl = Array.from(document.querySelectorAll("meta[property='og:url']"));
    const url = metaTagsUrl.length > 0 ? metaTagsUrl[0].getAttribute("content") : null;
    
    const recipeDataElement = document.querySelector(".recipe_data");
    const difficulty = recipeDataElement.querySelector(".difficulty").innerText.trim();
    const persons = recipeDataElement.querySelector(".persons").innerText.replace(/\n/g, ' ').trim();
    const timeM20 = recipeDataElement.querySelector(".time.m20").innerText.replace(/\n/g, ' ').trim();
    const timeM15 = recipeDataElement.querySelector(".time.m15").innerText.replace(/\n/g, ' ').trim();
    
    const specialNeedsElement = document.querySelector(".special_needs_container");
    const specialNeeds = specialNeedsElement ? Array.from(specialNeedsElement.querySelectorAll("span")).map(span => span.innerText) : [];
    
    const nutritionalInfoElement = document.querySelector(".nutrition_content");
    const kcalRation = nutritionalInfoElement.querySelector(".kcal_ration span").innerText;
    const fats = Array.from(nutritionalInfoElement.querySelectorAll(".fats td")).map(td => td.innerText);
    const hydrates = Array.from(nutritionalInfoElement.querySelectorAll(".hydrates td")).map(td => td.innerText);
    const proteins = Array.from(nutritionalInfoElement.querySelectorAll(".proteins td")).map(td => td.innerText);
    
    // New: Scraping additional nutritional information
    const additionalInfoElement = document.querySelector(".nutrition_data");
    const sugars = additionalInfoElement.querySelector("td:nth-child(2)").innerText;
    const fiber = additionalInfoElement.querySelector("tr:nth-child(2) td:nth-child(2)").innerText;
    const saturatedFats = additionalInfoElement.querySelector("tr:nth-child(3) td:nth-child(2)").innerText;
    const salt = additionalInfoElement.querySelector("tr:nth-child(4) td:nth-child(2)").innerText;
    
    // New: Scraping recipe ingredients
    const recipeIngredientsElement = document.querySelector(".dropdown_content.ingredients");
    const recipeIngredients = recipeIngredientsElement ? Array.from(recipeIngredientsElement.querySelectorAll("ul li")).map(li => li.innerText) : [];
    
    // New: Scraping recipe category
    const keywordsMeta = document.querySelector("meta[name='keywords']").getAttribute("content");
    const recipeCategory = keywordsMeta.split(",").map(keyword => keyword.trim());
    
    // New: Scraping recipe instructions
    const recipeInstructionsElement = document.querySelector(".dropdown_content.elaboration_text");
    const recipeInstructions = recipeInstructionsElement ? Array.from(recipeInstructionsElement.querySelectorAll("p")).map(p => p.innerText) : [];

    return { title, imagen, url, recipeData: { difficulty, persons, timeM20, timeM15 }, specialNeeds, nutritionalInfo: { kcalRation, fats, hydrates, proteins }, additionalInfo: { sugars, fiber, saturatedFats, salt }, recipeIngredients, recipeCategory, recipeInstructions };
  });

  await browser.close();

  const receta = new Receta(data.title, data.imagen, data.url, data.recipeData, data.specialNeeds, data.nutritionalInfo, data.additionalInfo, data.recipeIngredients, data.recipeCategory, data.recipeInstructions);
  return receta;
}

getDataFromWebPage().then(receta => {
  console.log("Título:", receta.titulo);
  console.log("Imagen:", receta.imagen);
  console.log("URL:", receta.url);
  console.log("Datos de la receta:", receta.recipeData);
  console.log("Necesidades especiales:", receta.specialNeeds);
  console.log("Información nutricional:", receta.nutritionalInfo);
  console.log("Información adicional:", receta.additionalInfo);
  console.log("Ingredientes de la receta:", receta.recipeIngredients);
  console.log("Categoría de la receta:", receta.recipeCategory);
  console.log("Instrucciones de la receta:", receta.recipeInstructions);
}).catch(error => {
  console.error("Error:", error);
});
