import browser from 'detect-browser';
import 'whatwg-fetch';
import React, { Component } from "react";
import Masonry from 'react-masonry-component';
import styled, { injectGlobal } from "styled-components"; // { ThemeProvider }
import Offline from "./Offline";
import Story from "./Story";
import Background from "./assets/handmadepaper.png";
import titleFont from './assets/OldeEnglish.ttf';

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

// @media is to define different style rules for different media types
injectGlobal`
  body {
    background: #eef1f1;
    background-image: url(${Background});
    color: ${black};
    font-family: 'Times New Roman', Times, serif;
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

// Bar is a react component calling the 'styled.div' function passing in the parameters
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
  font-weight: normal;
  font-family: TitleFont;
  margin: 0.809rem 0;
  text-align: center;

  @font-face {
    font-family: TitleFont;
    src: url(${titleFont});
  }

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
      usingExtension: null,
    };
  }


  componentDidMount() {
    this.setState({
      browser: browser.name,
      usingExtension: window.self !== window.top,
      version: parseFloat(browser.version),
    });

    this.getStories();
    window.addEventListener("offline", this.toggleConnection);
    window.addEventListener("online", this.toggleConnection);

    // if (window.location.hostname !== 'localhost') {
    //   ReactGA.initialize('UA-43808769-9');
    //   ReactGA.pageview('pageview');
    // }
  }

  getStories = () => {
    if (
      storageAvailable("localStorage") &&
      !navigator.onLine &&
      localStorage.getItem("stories") !== null
    ) {
      // Offline, but should have old stories to share
      this.setState({
        fetching: false,
        offline: true,
        stories: JSON.parse(localStorage.getItem("stories"))
      });
    } else {
      fetch('/worldnews').then(response => response.json()).then(response => {
        console.log("Before:", response);
        const stories = response.newStories
          .filter(
            (thing, index, self) =>
              self.findIndex(t => t.id === thing.id) === index
          )
          .sort((a, b) => a.position - b.position);
          console.log("After:", stories);

        this.setState({
          fetching: false,
          offline: false,
          stories
        });

        if (storageAvailable("localStorage")) {
          localStorage.setItem("stories", JSON.stringify(stories));
        }
      });
    }
  };

  toggleConnection = connected => {
    if (navigator.onLine) { // deterimines whether the browser is online
      this.getStories();
    } else {
      this.setState({ offline: true });
    }
  };

  render() {
    return (
      <div>
        <Title>The Fast News</Title>
        <Bar>
          <Subheader>
            <Medium>
              <a href="https://saimun92.github.io/">Lee Sai Mun</a>
            </Medium>
            <Tagline>
              Top voted stories across the web, summarized and updated every sixty seconds.
            </Tagline>
            <Medium>
              <a href="https://www.reddit.com/r/worldnews/">WorldNews</a>
              ,
              {" "}
              <a href="https://www.reddit.com">Reddit</a>
            </Medium>
          </Subheader>
          <Offline black={black} offline={this.state.offline} />
        </Bar>
        <Masonry
          options={{
            columnWidth: '.grid-sizer',
            gutter: '.gutter-sizer',
            percentPosition: true,
            transitionDuration: 0,
          }}
          updateOnEachImageLoad={true}
        >
          <div className="grid-sizer" />
          <div className="gutter-sizer" />
          <Story
            fetching={this.state.fetching}
            thumbnail
            {...this.state.stories[0]}
          />
          <Story
            double
            fetching={this.state.fetching}
            {...this.state.stories[1]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[2]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[3]}
            />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[4]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[5]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[6]}
          />
          <Story
            fetching={this.state.fetching}
            thumbnail
            {...this.state.stories[7]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[8]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[9]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[10]}
          />
          {
            this.state.stories
            .slice(11)
            .map((story) => (
                <Story
                  fetching={this.state.fetching}
                  key={story.id}
                  {...story}
                />
              ))
          }
        </Masonry>
      </div>
    );
  }
}

export default App;
