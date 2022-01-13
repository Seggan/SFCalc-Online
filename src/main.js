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

function add(map1, map2, amount) {
    for (const key in map2) {
        if (key in map1) {
            let inThere = map1[key];
            inThere += map2[key] * amount;
            map1[key] = inThere;
        } else {
            map1[key] = map2[key] * amount;
        }
    }
}

function calculate(itemStr) {
    const results = {};
    const item = items[itemStr];
    for (const ing of item.recipe) {
        const value = ing.value;
        const ingItem = items[value];
        if (ing.value.toUpperCase() != ing.value || blacklistedItems.includes(value) || blacklistedRecipes.includes(ingItem.recipeType)) {
            const temp = {};
            temp[value] = 1;
            add(results, temp, ing.amount);
        } else {
            const ret = calculate(value);
            add(results, ret, ing.amount);
        }
    }

    return results;
}

window.onload = _e => {
    document.getElementById('calculator').onsubmit = _e => {
        const id = document.getElementById('id').value.toUpperCase();
        if (!(id in items)) {
            alert('Invalid item ID');
            return false;
        }

        let results = calculate(id);

        results = Object.fromEntries(Object.entries(results).sort(([,a],[,b]) => a-b));

        document.getElementById('result-table').removeAttribute('hidden');

        const div = document.getElementById('results');
        div.innerHTML = '';
        for (const result in results) {
            let color = '_0';
            let name = result;

            if (name.toUpperCase() === name) {
                name = items[result].name;
            }

            if (name.startsWith('§')) {
                color = '_' + name.charAt(1);
                name = name.substring(2);
            }

            const disp = document.createElement('tr');
            disp.innerHTML = '<td class="' + color + '\"><b>' + name + '</b></td><td>' + results[result] * document.getElementById('amount').value + '</td>';

            div.appendChild(disp);
        }

        return false;
    };
};