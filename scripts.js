const powerPerTier = {
    t1: 2, t2: 2.7, t3: 3.65, t4: 4.92, t5: 6.64, t6: 8.97,
    t7: 12.11, t8: 16.34, t9: 22.06, t10: 29.79, t11: 35.75,
    t12: 53.63, t13: 81, t14: 122
};

function formatAndCalculate(element) {
    let value = element.value.replace(/,/g, '');
    // Allow decimals with up to two decimal places
    if (!isNaN(value) && value !== '' && /^-?\d*\.?\d*$/.test(value)) {
        // Ensure proper formatting with commas and decimal places
        element.value = parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        calculate();
    } else if (value === '') {
        element.value = '';
        calculate();
    }
}

function calculate() {
    let foodPerBatch = parseFloat(document.getElementById('foodBatch').value.replace(/,/g, '')) || 0;
    let foodUnit = document.getElementById('foodUnit').value;
    let woodPerBatch = parseFloat(document.getElementById('woodBatch').value.replace(/,/g, '')) || 0;
    let woodUnit = document.getElementById('woodUnit').value;
    let stonePerBatch = parseFloat(document.getElementById('stoneBatch').value.replace(/,/g, '')) || 0;
    let stoneUnit = document.getElementById('stoneUnit').value;
    let orePerBatch = parseFloat(document.getElementById('oreBatch').value.replace(/,/g, '')) || 0;
    let oreUnit = document.getElementById('oreUnit').value;
    let crystalCost = parseFloat(document.getElementById('crystalCost').value.replace(/,/g, '')) || 0;
    let powerPerBatch = parseFloat(document.getElementById('powerPerBatch').value.replace(/,/g, '')) || 0;
    let crystalsAvailable = parseFloat(document.getElementById('crystalsAvailable').value.replace(/,/g, '')) || 0;

    // Adjust RSS based on unit selected
    foodPerBatch = adjustResourceValue(foodPerBatch, foodUnit);
    woodPerBatch = adjustResourceValue(woodPerBatch, woodUnit);
    stonePerBatch = adjustResourceValue(stonePerBatch, stoneUnit);
    orePerBatch = adjustResourceValue(orePerBatch, oreUnit);

    let totalPower = 0;
    let totalTroops = 0;
    let powerBreakdownText = '';
    let rssBreakdownText = '';

    // Calculate total power and troop count
    for (let i = 1; i <= 14; i++) {
        let tierCount = parseFloat(document.getElementById(`t${i}`).value.replace(/,/g, '')) || 0;
        totalPower += tierCount * powerPerTier[`t${i}`];
        totalTroops += tierCount;

        if (tierCount > 0) {
            powerBreakdownText += `Tier ${i}: ${tierCount.toLocaleString()} troops * ${powerPerTier[`t${i}`]} power each = ${(tierCount * powerPerTier[`t${i}`]).toLocaleString()} power.<br>`;
        }
    }

    let batchesNeeded = totalPower > 0 ? Math.ceil(totalPower / powerPerBatch) : 0;
    let totalCrystalsNeeded = batchesNeeded * crystalCost;
    let additionalCrystalsNeeded = Math.max(0, totalCrystalsNeeded - crystalsAvailable);

    // Calculate resources needed
    let totalFood = batchesNeeded * foodPerBatch;
    let totalWood = batchesNeeded * woodPerBatch;
    let totalStone = batchesNeeded * stonePerBatch;
    let totalOre = batchesNeeded * orePerBatch;

    // Prepare the RSS breakdown text
    rssBreakdownText += `Food: ${formatRSS(totalFood)} based on ${batchesNeeded} batches.<br>`;
    rssBreakdownText += `Wood: ${formatRSS(totalWood)} based on ${batchesNeeded} batches.<br>`;
    rssBreakdownText += `Stone: ${formatRSS(totalStone)} based on ${batchesNeeded} batches.<br>`;
    rssBreakdownText += `Ore: ${formatRSS(totalOre)} based on ${batchesNeeded} batches.<br>`;

    // Update the display
    document.getElementById('totalTroops').textContent = totalTroops.toLocaleString();
    document.getElementById('results').innerHTML = `
        <h3>Results</h3>
        <p>Total Power: ${totalPower.toLocaleString()}</p>
        <p>Total Crystals Needed: ${totalCrystalsNeeded.toLocaleString()}</p>
        <p>Additional Crystals Needed: ${additionalCrystalsNeeded.toLocaleString()}</p>
        <p>Total Food Needed: ${formatRSS(totalFood)}</p>
        <p>Total Wood Needed: ${formatRSS(totalWood)}</p>
        <p>Total Stone Needed: ${formatRSS(totalStone)}</p>
        <p>Total Ore Needed: ${formatRSS(totalOre)}</p>
    `;

    // Display the breakdowns for power and resources
    document.getElementById('power-breakdown').innerHTML = `
        <h3>Power Calculation</h3>
        <p>${powerBreakdownText || 'No power calculations yet.'}</p>
    `;

    document.getElementById('rss-breakdown').innerHTML = `
        <h3>RSS Calculations</h3>
        <p>${rssBreakdownText || 'No resource calculations yet.'}</p>
    `;
}

// Function to format resource amounts for clarity (thousands, millions, billions)
function formatRSS(value) {
    if (value >= 1e9) {
        return (value / 1e9).toFixed(2) + ' billion';
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(2) + ' million';
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(2) + ' thousand';
    } else {
        return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
}

// Function to adjust resource values based on the unit (thousands, millions, billions)
function adjustResourceValue(value, unit) {
    switch (unit) {
        case 'thousands':
            return value * 1e3;
        case 'millions':
            return value * 1e6;
        case 'billions':
            return value * 1e9;
        default:
            return value;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Initialize troop input fields dynamically for tiers 1-14
    const troopContainer = document.getElementById('troop-inputs');
    for (let i = 1; i <= 14; i++) {
        let div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label for="t${i}">Tier ${i}:</label>
            <input type="text" id="t${i}" placeholder="Enter count" oninput="formatAndCalculate(this)">
        `;
        troopContainer.appendChild(div);
    }

    document.getElementById('powerPerBatch').value = Number(document.getElementById('powerPerBatch').value.replace(/,/g, '')).toLocaleString();
    calculate();
});
