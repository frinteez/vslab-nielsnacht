
// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const InMemoryGeoTagStore = require('../models/geotag-store');

// App routes (A3)

const store = new InMemoryGeoTagStore();

// Load example GeoTags into the store
store.populateWithExamples(); // Call this method to load example GeoTags into the store
//const tags = store.getGeoTags(); // Holen Sie sich alle GeoTags


const ITEMS_PER_PAGE = 5;
let searchTerm = " ";

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
  
  const { latitude, longitude, searchterm, page } = req.query;
  let results = store.getGeoTags();
  
  if (searchterm) {
    results = store.searchNearbyGeoTags(searchterm, latitude, longitude, 100); // Adjust radius as needed
  } else if (latitude && longitude) {
    results = store.getNearbyGeoTags(parseFloat(latitude), parseFloat(longitude), 100); // Adjust radius as needed
  }

  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let currentPage = parseInt(page) || 1;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  let start = (currentPage - 1) * ITEMS_PER_PAGE;
  let paginatedResults = results.slice(start, start + ITEMS_PER_PAGE);

  res.render('index', {
    taglist: paginatedResults,  // Assuming you'll populate taglist appropriately
    latitude: null,
    longitude: null,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalItems,
    searchTerm:" ",

  });
});

// Function to calculate pagination parameters



// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
router.get('/api/geotags', (req, res) => {
  const { latitude, longitude, searchterm,page } = req.query;
  let results = store.getGeoTags();

  let totalItems = results.length;
  let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let currentPage = parseInt(req.query.page) || 1;

  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (searchterm) {
    results = store.searchNearbyGeoTags(searchterm, latitude, longitude, 100); // Adjust radius as needed
    
  } else if (latitude && longitude) {
    console.log("latitude: "+latitude + " longitude: "+longitude + " searchterm: ");
    results = store.getNearbyGeoTags(parseFloat(latitude), parseFloat(longitude), 100); // Adjust radius as needed
  }
  let start = (currentPage - 1) * ITEMS_PER_PAGE;
  let paginatedResults = results.slice(start, start + ITEMS_PER_PAGE);
  totalItems = results.length;
  totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  currentPage = parseInt(req.query.page) || 1;
  return res.status(200).json({
    taglist: paginatedResults, 
    latitude: null,
    longitude: null,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalItems,
    searchTerm:" ",

  });
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.post('/api/geotags', (req, res) => {
  const { name, latitude, longitude, hashtag } = req.body;

  req.query.searchterm = "";

  const newGeoTag = new GeoTag(name, latitude, longitude, hashtag);
  store.addGeoTag(newGeoTag);
  let results = store.getNearbyGeoTags(latitude, longitude, 100);
  let totalItems = results.length;
  let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let currentPage = parseInt(req.query.page) || 1;
  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  let start = (currentPage - 1) * ITEMS_PER_PAGE;
  let paginatedResults = results.slice(start, start + ITEMS_PER_PAGE);

  const nearbyTags = store.getNearbyGeoTags(newGeoTag.latitude, newGeoTag.longitude, 100).filter; // Adjust radius as needed
  res.status(201).json(paginatedResults);
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.get('/api/geotags/:id?', (req, res) => {
  const id = parseInt(req.params.id);
  const tag = store.getGeoTagById(id);
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).send('GeoTag not found get');
  }
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id?', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, latitude, longitude, hashtag } = req.body;
  const updatedGeoTag = new GeoTag(name, latitude, longitude, hashtag, id);
  const result = store.updateGeoTag(id, updatedGeoTag);
  if (result) {
    res.json(result);
  } else {
    res.status(404).send('GeoTag not found put');
  }
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.delete('/api/geotags/:id?', (req, res) => {
  const id = parseInt(req.params.id);
  const result = store.removeid(id);
  if (result) {
    res.json(result);
  } else {
    res.status(404).send('GeoTag not found del');
  }
});



module.exports = router;
