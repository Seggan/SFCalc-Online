// Copyright (C) 2021 Seggan
// 
// This file is part of SFCalc-Online.
// 
// SFCalc-Online is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// SFCalc-Online is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with SFCalc-Online.  If not, see <http://www.gnu.org/licenses/>.

const items = {};
const blacklistedItems = [
    "UU_MATTER",
    "SILICON",
    "RUBBER",
    "VOID_BIT"
];
const blacklistedRecipes = [
    "ore_washer",
    "geo_miner",
    "gold_pan",
    "mob_drop",
    "barter_drop",
    "ore_crusher",
    "multiblock",
    "meteor_attractor",
    "alien_drop",
    "world_gen"
];

let options = '';
fetch('https://raw.githubusercontent.com/Seggan/SFCalc-Online/master/src/items.json')
.then(res => res.json())
.then(itemList => {
    for (const item of itemList) {
        items[item.id] = item;
        options += '<option value="' + item.id + '">';
    }
    document.getElementById('allitems').innerHTML = options;
}).catch(_err => console.error);

function add(map, key, amount) {
    if (key in map) {
        map[key] += amount;
    } else {
        map[key] = amount;
    }
}

function calculate(itemStr, amount) {
    const results = {};
    const item = items[itemStr];

    results[item.id] = amount;

    let nextItem;
    while (nextItem = getNextItem(results)) {
        const operations = Math.ceil(results[nextItem.id] / nextItem.result);
        add(results, nextItem.id, -1 * operations * nextItem.result);
        for(const ingredient of nextItem.recipe) {
            add(results, ingredient.value, operations * ingredient.amount);
        }
    }

    return results;
}

function getNextItem(map) {
    for(const item in map) {
        if(item.toUpperCase() == item && !blacklistedItems.includes(item) && !blacklistedRecipes.includes(items[item].recipeType) && map[item] > 0) {
            return items[item];
        }
    }
    return null;
}

window.onload = _e => {
    document.getElementById('calculator').onsubmit = _e => {
        const id = document.getElementById('id').value.toUpperCase();
        if (!(id in items)) {
            alert('Invalid item ID');
            return false;
        }

        const amount = parseInt(document.getElementById('amount').value);
        let results = calculate(id, amount);

        results = Object.fromEntries(Object.entries(results).sort(([,a],[,b]) => a-b));

        document.getElementById('result-table').removeAttribute('hidden');

        const div = document.getElementById('results');
        div.innerHTML = '';
        for (const result in results) {
            let color = '_0';
            let name = result;

            if(results[name] <= 0) {
                continue;
            }

            if (name.toUpperCase() === name) {
                name = items[result].name;
            }

            if (name.startsWith('§')) {
                color = '_' + name.charAt(1);
                name = name.substring(2);
            }

            const disp = document.createElement('tr');
            disp.innerHTML = '<td class="' + color + '\"><b>' + name + '</b></td><td>' + results[result] + '</td>';

            div.appendChild(disp);
        }

        return false;
    };
};