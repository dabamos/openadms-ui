/**
 * @file      The chart page.
 * @author    Philipp Engel
 * @license   BSD-2-Clause
 * @copyright Hochschule Neubrandenburg - University of Applied Sciences, 2018
 * @see       {@link https://github.com/dabamos/openadms-ui/}
 */

/* Initialise the logger. */
let logger = Logger.get('charts');

/*
 * Load settings from LocalStorage.
 */
let settings = new UI.Models.Settings('couchdb');
settings.fetch();

/*
 * Database connection details.
 */
/* CouchDB credentials. */
const credentials = {
    username: settings.get('username'),
    password: settings.get('password')
};

/* PouchDB options. */
const pouchOpts = {
    skip_setup: true,
    auth: credentials
};

/* AJAX options. */
const ajaxOpts = {
    ajax: {
        headers: {
            Authorization: 'Basic ' + window.btoa(credentials.username + ':' + credentials.password)
        },
        withCredentials: false
    }
};

/*
 * The plotly.js layout.
 */
let layout = {
    hovermode: 'closest',
    autosize: true,
    font: {
        family: 'Inter UI',
        size: 12,
        color: '#212121',
    },
    margin: {
        autoexpand: false,
        l: 50,
        r: 25,
        b: 50,
        t: 25,
        pad: 0
    },
    showlegend: true,
    xaxis: {
        showline: true,
        showgrid: true,
        showticklabels: true,
        ticks: 'outside',
        title: 'x-axis title',
        type: 'date'
    },
    yaxis: {
        showline: true,
        title: 'y-axis title',
    }
};

/* The plotly.js chart options. */
let options = {
    displaylogo: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
    responsive: true,
    scrollZoom: true
};

/* The plotly.js chart data. */
let data = {
    x: [],
    y: [],
    text: [],
    type: 'lines',
    name: 'Temperature &amp; Pressure',
    line: {
        color: 'rgb(19, 84, 122)',
        width: 1
    }
};

/*
 * Create PouchDB database and query time series from remote CouchDB instance.
 */
const url = settings.get('host') + ':' + settings.get('port') + '/' + settings.get('database');
const db = new PouchDB(url, pouchOpts);

db.login(credentials.username, credentials.password, ajaxOpts).then(function () {
    return db.query('by_date/observations',
        {
            startkey: ['4a2e8b9d87d849e38bb6911b9f2364ea', '6426bf58c20840768912f116740c4974', 'tp', '2017'],
            endkey: ['4a2e8b9d87d849e38bb6911b9f2364ea', '6426bf58c20840768912f116740c4974', 'tp', '2019'],
            include_docs: true
        });
}).then(function (docs) {
    if (docs.total_rows == 0) {
        $('.ui.error.message').html(`No documents found`).toggle();
        return;
    }

    data.name = docs.rows[0].doc.target;

    docs.rows.forEach(function (item) {
        data.x.push(item.doc.timestamp);
        data.y.push(item.doc.responseSets.temperature.value);
        data.text.push(`unit: ${item.doc.responseSets.temperature.unit}`);
    });

    /*
     * Plot the time series.
     */
    Plotly.newPlot('plot', [data], layout, options);
}).catch(function (error) {
    /*
     * Output connection error message to message box.
     */
    logger.debug(error.message);
    $('.ui.error.message').html(`Error: ${error.message}`).toggle();
});