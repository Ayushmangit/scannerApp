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

    if (data.status === 1 && data.product) {
      const product = data.product;
      const productName = product.product_name || "Unnamed Product";
      const productImage = product.image_front_small_url || "";
      const ingredients =
        product.ingredients_text || "Ingredients not available.";

      searchType.textContent = "Barcode Scan:";
      resultDisplay.innerHTML = `
        <p><strong>✅ Product:</strong> ${productName}</p>
        ${
          productImage
            ? `<img src="${productImage}" alt="${productName}" style="max-width: 150px; margin-top: 10px; border-radius: 8px;" />`
            : ""
        }
        
        <p><strong>🧪 Ingredients:</strong> ${ingredients}</p>
      `;
    } else {
      resultDisplay.textContent = `❌ Product not found.`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    resultDisplay.textContent = `❌ Error fetching product data.`;
  }
}

// Manual barcode submission
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
      function (err) {
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

     const scannerContainer = document.getElementById("scanner-container");
    scannerContainer.innerHTML = ""; // Remove video element
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

    if (data.products && data.products.length > 0) {
      const product = data.products[0]; // Take the first match
      const productName = product.product_name || "Unnamed Product";
      const productImage = product.image_front_small_url || "";

      const ingredients =
        product.ingredients_text || "Ingredients not available.";

      searchType.textContent = "Name Scan:";
      resultDisplay.innerHTML = `
        <p><strong>✅ Product:</strong> ${productName}</p>
        ${
          productImage
            ? `<img src="${productImage}" alt="${productName}" style="max-width: 150px; margin-top: 10px;" />`
            : ""
        }
        
        <p><strong>🧪 Ingredients:</strong> ${ingredients}</p>
      `;
    } else {
      resultDisplay.textContent = `❌ No product found for "${name}".`;
    }
  } catch (error) {
    console.error("Search error:", error);
    resultDisplay.textContent = `❌ Error searching product.`;
  }
}

Quagga.onProcessed(function (result) {
  console.log("processed frame", result);
});
