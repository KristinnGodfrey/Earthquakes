import express from 'express';
import fetch from 'node-fetch';
import { getter, setter } from './cache.js';
import { timerStart, timerEnd } from './time.js';

export const router = express.Router();

async function getData(req, res) {
  const { period, type } = req.query;

  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${period}_${type}.geojson`;
  const cacheKey = `type:${period}-period:${type}`;
  const timer = timerStart();

  let earthquakes;
  const cached = await getter(cacheKey);

  if (cached) {
    earthquakes = cached;
  } else {
    earthquakes = await (await fetch(url)).json();
    setter(cacheKey, earthquakes, 60);
  }

  const elapsed = timerEnd(timer);

  const result = {
    data: earthquakes,
    info: {
      elapsed,
      cache: cached != null,
    },
  };
  return res.json(result);
}

router.get('/', getData);
