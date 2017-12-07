const express = require('express');

// this will attemp to compress response bodies for all request that traverse through the middleware
const compression = require('compression'); // Nodejs compression middleware
const fs = require('fs'); // make file operation api simple
const path = require('path'); // this module provides utilities for working with file and directory paths.
const request = require('request');

const app = express();
const keys = require('./keys.json');
const port = process.env.PORT || 8080;
const snoowrap = require('snoowrap');

// Middlewares
app.use(compression());
//xpress will have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header fields may be trusted,
//which otherwise may be easily spoofed.
app.enable("trust proxy");

const reddit = new snoowrap(keys);

let current = 0;
let length = 0;
let newStories = [];
let stories = [];

// const based function
const getComments = story => {
  reddit.getSubmission(story.id).fetch().then( post => { // Gets info on a given submission
    current += 1;
    // console.log(post.comments);
    for(let comment of post.comments) { // look for the author name = autotldr (a bot that summaries articles)
      if (comment.author.name === 'autotldr') {
        const description = comment.body_html.substr(
          comment.body_html.indexOf("<blockquote>") + 13,
          comment.body_html.indexOf("</blockquote>") -
            comment.body_html.indexOf("<blockquote>") - 13
        );

        const image = post.preview && post.preview.images && post.preview.images[0] ? post.preview.images[0].resolutions[3] : [];

        // append newStories into the existing array and store it in the same variable
        newStories = [...newStories,
          {
            description,
            domain: post.domain,
            id: post.id,
            image,
            position: post.position,
            title: post.title,
            url: post.url
          }
        ];
      }

      // If the loop has reached the end of the array, then set current and length back to 0 and store
      // newStories array into stories variable.
      if ( current >= length && length > 0) {
        current = 0;
        length = 0;
        stories = newStories;
      }
    }
  })
  .catch( err => {
    console.log(err);
  });
};

const getStories = () => {
  // get a list of hot posts on this "worldnews" subreddit (u want the id only to get the full data later on)
  reddit.getSubreddit("worldnews").getHot({ limit: 50 }).then( posts => {
    newStories = [];
    length = posts.length;

    for (var i=0; i<posts.length; i++) {
      getComments({
        ...posts[i],
        position: i,
      });
    }
    // console.log(posts[1]);
  })
  .catch( err => {
    console.log(err);
  });
};

// call once before the 60s
getStories();


//getStories every 60 secs
setInterval(() => {
  getStories();
}, 60000);

// expose the end-points by sending the object stories
app.get("/worldnews", (req, res) => {
  res.send({ stories });
});

// let's encrypy free certificate authority so as to enable https
app.use((req, res, next) => {
  if (req.secure || req.headers.host === `localhost:${port}` || req.url.includes('/.well-known/acme-challenge')) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

app.get(`/.well-known/acme-challenge/${process.env.LETS_ENCRYPT_ROUTE}`,
  (req, res) => {
    res.send(process.env.LETS_ENCRYPT_VERIFICATION);
  },
);

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // link our main.js file, or main.css file!
  app.use(express.static('client/build')); // if there is no such route, look into the client/build directory

  // Express will serve up the index.html file
  // if it dosen't recognize the route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, err => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`App and API is livessss at http://localhost:${port}`);
});
