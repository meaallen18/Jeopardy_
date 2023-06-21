"use strict";

const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;
const BASE_URL = "https://jservice.io/api/";

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const response = await axios.get(`${BASE_URL}categories?count=100`);
  let categoryIds = _.sampleSize(_.map(response.data, "id"), NUM_CATEGORIES);
  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "2+2", answer: "4", showing: null},
 *      {question: "1+1", answer: "2", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get(`${BASE_URL}category?id=${catId}`);
  let category = response.data;
  let clues = category.clues.slice(0, NUM_CLUES).map(clue => {
    return { question: clue.question, answer: clue.answer, showing: null };
  });
  return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
function fillTable() {
  $("#jeopardy thead").empty();
  let $tr = $("<tr>");
  for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
    $tr.append($("<th>").text(categories[catIdx].title));
  }
  $("#jeopardy thead").append($tr);

  $("#jeopardy tbody").empty();
  for (let clueIdx = 0; clueIdx < NUM_CLUES; clueIdx++) {
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
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
  let id = evt.target.id;
  let [catIdx, clueIdx] = id.split("-");
  let clue = categories[catIdx].clues[clueIdx];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    return;
  }
  $(`#${catIdx}-${clueIdx}`).text(msg);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    let categoryIds = await getCategoryIds();
  
    categories = [];
  
    let promises = categoryIds.map(catId => getCategory(catId));
    categories = await Promise.all(promises);
  
    fillTable();
  }

/** On click of start / restart button, set up game. */
$("#start").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */
$(async function() {
  $("#jeopardy").on("click", "td", handleClick);
  await setupAndStart();
});
