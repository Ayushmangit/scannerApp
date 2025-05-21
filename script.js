const manualInput = document.getElementById("manual-barcode");
const submitBtn = document.getElementById("submit-barcode");
const resultDisplay = document.getElementById("barcode-result");
const searchType = document.getElementById("searchType");

// Reusable async function to fetch product details
async function fetchProduct(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    resultDisplay.innerHTML = "";

    if (data.status === 1 && data.product) {
      const product = data.product;
      const productName = product.product_name || "Unnamed Product";
      const productImage = product.image_front_small_url || "";
      const ingredients =
        product.ingredients_text_en ||
        product.ingredients_text ||
        "Ingredients not available.";
      const nutriments = product.nutriments || {};

      searchType.textContent = "Barcode Scan:";

      const nameElem = document.createElement("p");
      nameElem.innerHTML = `<strong>✅ Product:</strong> ${productName}`;
      resultDisplay.appendChild(nameElem);

      if (productImage) {
        const imgElem = document.createElement("img");
        imgElem.src = productImage;
        imgElem.alt = productName;
        imgElem.style.maxWidth = "150px";
        imgElem.style.marginTop = "10px";
        imgElem.style.borderRadius = "8px";
        resultDisplay.appendChild(imgElem);
      }

      const ingredientsElem = document.createElement("p");
      ingredientsElem.innerHTML = `<strong>🧪 Ingredients:</strong> ${ingredients}`;
      resultDisplay.appendChild(ingredientsElem);

      const nutritionHeading = document.createElement("p");
      nutritionHeading.innerHTML = "<strong>📊 Nutrition (per 100g):</strong>";
      resultDisplay.appendChild(nutritionHeading);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.maxWidth = "400px";
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.style.border = "1px solid #ccc";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ccc;">Nutrient</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Per 100g</th>
        </tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      const nutritionData = [
        ["Energy", nutriments["energy-kcal_100g"], "kcal"],
        ["Fat", nutriments.fat_100g, "g"],
        ["Saturated Fat", nutriments["saturated-fat_100g"], "g"],
        ["Carbohydrates", nutriments.carbohydrates_100g, "g"],
        ["Sugars", nutriments.sugars_100g, "g"],
        ["Proteins", nutriments.proteins_100g, "g"],
        ["Salt", nutriments.salt_100g, "g"],
      ];

      nutritionData.forEach(([label, value, unit]) => {
        const row = document.createElement("tr");

        const nutrientCell = document.createElement("td");
        nutrientCell.textContent = label;
        nutrientCell.style.padding = "6px";
        nutrientCell.style.border = "1px solid #ccc";

        const valueCell = document.createElement("td");
        valueCell.textContent = value ? `${value} ${unit}` : "-";
        valueCell.style.padding = "6px";
        valueCell.style.border = "1px solid #ccc";

        row.appendChild(nutrientCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      resultDisplay.appendChild(table);
    } else {
      resultDisplay.textContent = `❌ Product not found.`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    resultDisplay.textContent = `❌ Error fetching product data.`;
  }
}

submitBtn.addEventListener("click", async () => {
  const barcode = manualInput.value.trim();
  if (barcode) {
    await fetchProduct(barcode);
  } else {
    alert("Please enter a barcode.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-scan");
  const stopBtn = document.getElementById("stop-scan");

  startBtn.addEventListener("click", () => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#scanner-container"),
          constraints: {
            facingMode: "environment",
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        decoder: {
          readers: ["ean_reader", "upc_reader", "code_128_reader"],
        },
        locate: true,
      },
      function(err) {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
      }
    );
  });

  stopBtn.addEventListener("click", () => {
    Quagga.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  // Reuse fetchProduct after scan
  Quagga.onDetected(async (data) => {
    const code = data.codeResult.code;
    resultDisplay.textContent = `📦 Barcode Detected: ${code}`;
    await fetchProduct(code);
    Quagga.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });
});
//Search by name

const nameInput = document.getElementById("product-name");
const nameBtn = document.getElementById("search-name");

nameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) {
    searchProductByName(name);
  } else {
    alert("Please enter a product name.");
  }
});

async function searchProductByName(name) {
  const query = encodeURIComponent(name);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);

    // Clear previous results
    resultDisplay.innerHTML = "";

    if (data.products && data.products.length > 0) {
      const product = data.products[0]; // First matched product
      const productName = product.product_name || "Unnamed Product";
      const productImage = product.image_front_small_url || "";
      const ingredients =
        product.ingredients_text_en ||
        product.ingredients_text ||
        "Ingredients not available.";
      const nutriments = product.nutriments || {};

      searchType.textContent = "Name Scan:";

      // Product name
      const nameElem = document.createElement("p");
      nameElem.innerHTML = `<strong>✅ Product:</strong> ${productName}`;
      resultDisplay.appendChild(nameElem);

      // Product image
      if (productImage) {
        const imgElem = document.createElement("img");
        imgElem.src = productImage;
        imgElem.alt = productName;
        imgElem.style.maxWidth = "150px";
        imgElem.style.marginTop = "10px";
        imgElem.style.borderRadius = "8px";
        resultDisplay.appendChild(imgElem);
      }

      // Ingredients
      const ingredientsElem = document.createElement("p");
      ingredientsElem.innerHTML = `<strong>🧪 Ingredients:</strong> ${ingredients}`;
      resultDisplay.appendChild(ingredientsElem);

      // Nutrition heading
      const nutritionHeading = document.createElement("p");
      nutritionHeading.innerHTML = "<strong>📊 Nutrition (per 100g):</strong>";
      resultDisplay.appendChild(nutritionHeading);

      // Nutrition table
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.maxWidth = "400px";
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.style.border = "1px solid #ccc";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ccc;">Nutrient</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Per 100g</th>
        </tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      const nutritionData = [
        ["Energy", nutriments["energy-kcal_100g"], "kcal"],
        ["Fat", nutriments.fat_100g, "g"],
        ["Saturated Fat", nutriments["saturated-fat_100g"], "g"],
        ["Carbohydrates", nutriments.carbohydrates_100g, "g"],
        ["Sugars", nutriments.sugars_100g, "g"],
        ["Proteins", nutriments.proteins_100g, "g"],
        ["Salt", nutriments.salt_100g, "g"],
      ];

      nutritionData.forEach(([label, value, unit]) => {
        const row = document.createElement("tr");

        const nutrientCell = document.createElement("td");
        nutrientCell.textContent = label;
        nutrientCell.style.padding = "6px";
        nutrientCell.style.border = "1px solid #ccc";

        const valueCell = document.createElement("td");
        valueCell.textContent = value ? `${value} ${unit}` : "-";
        valueCell.style.padding = "6px";
        valueCell.style.border = "1px solid #ccc";

        row.appendChild(nutrientCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      resultDisplay.appendChild(table);
    } else {
      resultDisplay.textContent = `❌ No product found for "${name}".`;
    }
  } catch (error) {
    console.error("Search error:", error);
    resultDisplay.textContent = `❌ Error searching product.`;
  }
}

Quagga.onProcessed(function(result) {
  console.log("processed frame", result);
});
