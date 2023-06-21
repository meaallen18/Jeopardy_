// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const NUM_CATEGORIES = 6; 
const NUM_QUESTIONS_PER_CAT = 5;
const BASE_URL = "https://jservice.io/api/";
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get (`${BASE_URL}categories?count=100`);
    let categoryIds = response.data.map(category => category.id);
    //shuffle array of category Ids
    for (let i = 0; i < categoryIds.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [categoryIds[i], categoryIds[j]] = [categoryIds [j], categoryIds[i]];
    }
    categoryIds = categoryIds.slice(0, NUM_CATEGORIES);

return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function fetchCategoryData(catId) {
    const response = await axios.get(`${BASE_URL}category?id=${catId}`);
    let category = response.data;
    let clues = category.clues.map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
    }));
    return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
     // Clear the existing table content
        const tbody = document.querySelector("#jeopardy tbody");
        tbody.innerHTML = "";
        // Fetch the categories
        const categoryIds = await getCategoryIds();
        const categories = await Promise.all(categoryIds.map(fetchCategoryData));
        // Create table header
        const thead = document.querySelector("#jeopardy thead");
        const headRow = document.createElement("tr");
        categories.forEach((category) => {
          const td = document.createElement("td");
          td.innerText = category.title;
          headRow.appendChild(td);
        });
        thead.appendChild(headRow);
        // Create table body
        const tableBody = document.querySelector("#jeopardy tbody");
        for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
          const tr = document.createElement("tr");
          categories.forEach((category) => {
            const td = document.createElement("td");
            td.innerText = "?";
            td.clue = category.clues[i];
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        }
}
    

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let categoryCell = evt.target;
    let clue = categoryCell.clue;
    if (clue.showing === null) {
    categoryCell.innerText = clue.question;
    clue.showing = 'question';
    }
    else if (clue.showing === 'question') {
    categoryCell.innerText = clue.answer;
    clue.showing = 'answer';
    }
    else if (clue.showing === 'answer') {
        return;
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */


function showLoadingView() {
    document.querySelector('#spinner').style.display = 'block';
    document.querySelector('#start-button').disabled = true;
    };

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    document.querySelector('#spinner').style.display = 'none';
    document.querySelector('#start-button').disabled = false;
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    // get random category Ids
    const categoryIds = await getCategoryIds();

    // get data for each category
    categories = await Promise.all(categoryIds.map(fetchCategoryData));

    // create HTML table
    await fillTable();
}


document.querySelector("#start-button").addEventListener("click", async function() {
    showLoadingView();
    await setupAndStart();
    hideLoadingView();
});



window.onload = function() {
    fillTable();
    document.querySelector("#jeopardy tbody").addEventListener("click", function(evt) {
        const categoryCell = evt.target;
        if (categoryCell.innerText === "?") {
          const clue = categoryCell.clue;
          if (clue.showing === null) {
            categoryCell.innerText = clue.question;
            clue.showing = 'question';
          } else if (clue.showing === 'question') {
            categoryCell.innerText = clue.answer;
            clue.showing = 'answer';
          }
        }
    });
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
