import React, { useState, useEffect } from 'react';

import logo from './logo.svg';
import axios from 'axios'
import cheerio from 'cheerio'; 
import './App.css';

const url = `https://cors-anywhere.herokuapp.com/https://www.baanpolballs.com/pb/before.php`

// function loadDoc(theURL) {
//   // let xhttp = new XMLHttpRequest();
//   // xhttp.onreadystatechange = function () {
//   //   if (this.readyState === 4 && this.status === 200) {
//   //     return alert(xhttp.responseText);
//   //   }
//   // };
//   // xhttp.open('GET', theURL, false);
//   // xhttp.setRequestHeader('Content-Type', 'application/xml');
//   // xhttp.send();
//   axios.get(theURL)
//     .then((response) => {
//       if (response.status === 200) {
//         return response.data;
//         // const $ = cheerio.load(html);
//       }
//     });
// }

// <App data="1" title="Phone"></App>
// <App data="2" title="Sai"></App>

function App(prop) {
  const data = prop.data;
  const title = prop.title;

async function fetchHTML(theUrl){
  // return '<h2>Hello Rapee</h2>'
  const { data } = await axios.get(theUrl);
  // console.log('response', response);
  const $ = await cheerio.load(data);
  let table = {};
  table.date = $('#soccer-table > thead > tr:nth-child(1) > td').text()
  table.data = []
  let tmp = {};
  $('#soccer-table > tbody > tr').each(
    (id,element) => {
      if (element.children.length === 1) {
        tmp = {}
        tmp.league_name = $(element).text()
      }
      else {
        const row = element.children;
        tmp.time = $(row[0]).text();
        tmp.home = $(row[1]).text();
        tmp.away = $(row[2]).text();
        tmp.ratio = $(row[3]).text();
        tmp.forecast = $(row[4]).text().split('-');
        tmp.result = $(row[5]).text().split('-');
        tmp.opinion = $(row[6]).text();
        table.data.push(tmp);
        }
    }
    )
    console.log(table)
  return table;

    // .then((response) => {
    //   if (response.status === 200) {
    //     console.log(response.data)
    //     // return response.data;
    //     const hhh = response.data
    //   }
    // }).catch(err => {
    //   console.log(err);
    // })
  }

  const [htmlContent, setHtmlContent] = useState('');

  // htmlContent = 'hello'; // don't do this
  // setHtmlContent('hello');

  // useEffect(async () => ({
  // fetchdata(){
  //   // <table>...</table>
  //   const content = await html();
  //   setHtmlContent(content);
  // },)
  // });

  // const content = html(url);
  const table = fetchHTML(url);
  // let table = content.getElementById("soccer-table")[0]
  // console.log(table);
  // setHtmlContent(content);
 
  // console.log(html)


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Reactt
        </a>
        <pre>{ htmlContent }</pre>
      </header>
    </div>
  );
}

export default App;
