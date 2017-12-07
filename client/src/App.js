import React, { Component } from 'react';
import axios from 'axios';
import browser from 'detect-browser';
import Masonry from 'react-masonry-component';
import styled, { injectGlobal } from 'styled-components';
import Ad from './Ad';
import Offline from './Offline';
import Story from './Story';
import Background from './handmadepaper.png';

const black = "#2a2626";

const storageAvailable = type => {
  try {
    var storage = window[type], x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      storage.length !== 0
    );
  }
};

injectGlobal`
  body {
    background: #eef1f1;
    background-image: url(${Background});
    color: ${black};
    font-family: 'Times New Roman', serif;
    font-weight: 300;
    margin: 0 6.25vw;
    @media (min-width: 640px) {
      margin: 0 3.125vw;
    }
    @media (min-width: 1650px) {
      margin: 0 calc((100vw - 1650px) / 2 + 50px);
    }
  }
  @media (min-width: 640px) {
    .gutter-sizer {
      width: 6.66%;
    }
    .grid-sizer {
      width: 46.66%;
    }
  }

  @media (min-width: 1056px) {
    .gutter-sizer {
      width: 3.22%;
    }
    .grid-sizer {
      width: 22.58%;
    }
  }
  section {
    margin-bottom: 5.8vw;
    width: 100%;

    @media (min-width: 640px) {
      margin-bottom: 5vw;
      width: 46.66%;
    }

    @media (min-width: 1056px) {
      margin-bottom: 2.25vw;
      width: 22.58%;
      &.double {
        width: 48.387%;
      }
    }

    @media (min-width: 1650px) {
      margin-bottom: 38px;
    }
  }
`;

const Bar = styled.div`
  border-bottom: 1px solid ${black};
  border-top: 1px solid ${black};
  margin-bottom: 2.172rem;
`;

const Medium = styled.p`
  display: none;
  @media (min-width: 640px) {
    display: initial;
  }
`;

const Subheader = styled.div`
  display: flex;
  font-size: .875rem;
  justify-content: space-between;
  a, p {
    color: ${black};
    text-decoration: none;
  }
`;

const Tagline = styled.p`
  @media (min-width: 640px) {
    margin: auto 3.125vw;
  }
`;

const Title = styled.h1`
  font-size: 2.618rem;
  font-weight: 900;
  margin: 0.809rem 0;
  text-align: center;

  @media (min-width: 320px) {
    font-size: calc( 41.888px + (109.664 - 41.888) * (100vw - 320px) / (640 - 320) );
  }

  @media (min-width: 640px) {
    font-size: 6.854rem;
  }
`;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      browser: null,
      fetching: true,
      offline: false,
      stories: [],
      usingExtension: null
    }
  }
  render() {
    return (
      <div className="App">
        Hello world
      </div>
    );
  }
}

export default App;
