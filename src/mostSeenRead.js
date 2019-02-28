import React from 'react';
import * as toTitleCase from 'to-title-case';

export default class MostSeenRead extends React.Component {

  sortTitles = (a,b) => {
    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else if (a === b) {
      return 0;
    }
  }

  // toggle YearPlot size
  toggleMediaHighlight(mediaType) {
    const currentState = this.props.highlightMediaType;
    (mediaType===currentState) ? this.props.setMediaHighlightType("") : this.props.setMediaHighlightType(mediaType);
  }

  render() {
    const {
          compactMode,
          setHighlight,
          highlightMediaType,
          setMediaHighlightType,
          highlightedItem,
          listType} = this.props;

      // highlight class
      let itemClass = "";
      const authors = ["bill james","john barth","arthur nersesian","robert m. pirsig","david mitchell","michel houllebecq","edward st. aubyn","patricia highsmith","raymond chandler","kingsley amis","scott z. burns","karl ove gnausgaard","elena ferrante","john gray","patrick marber","simon callow","rachel cusk","jeffrey moussaieff masson","p. d. james"]
      const soderberghFilms = ["Haywire","Side Effects","Logan Lucky","Behind the Candelabra","Contagion","Magic Mike","Bitter Pill","Ocean's 8","Magic Mike XXL","Unsane","The Informant!"];
      // const movieData = ['Haywire', 'Side Effects', 'Logan Lucky', 'All the President\'s Men', 'Behind the Candelabra', 'Jaws', 'The Social Network', 'Magic Mike', 'Sunset Boulevard'];
      const movieData= ["All the President's Men","Jaws","The Social Network","Sunset Boulevard","The Day of the Jackal","Panic Room","The Parallax View","2001: A Space Odyssey","Three Days of the Condor","Citizen Kane","Sexy Beast","Raiders of the Lost Ark","Sweet Smell of Success","Carnal Knowledge","Anatomy of a Murder","The Hot Rock","Barry Lyndon","Zodiac","Chinatown","Apocalypse Now","All About Eve","Catch-22","Fatal Attraction","A Walk Among the Tombstones","The Godfather","The Verdict","American Graffiti","The Graduate","Repulsion","Alien","The French Connection","Funeral in Berlin","The Killing","Se7en","The Conformist","Klute","Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb","Double Indemnity","The Game","Ryan's Daughter","Sorcerer","Visitors","The Third Man","Mad Max: Fury Road"];
      const tvData = ["Dateline","Breaking Bad","The Americans","Boardwalk Empire","Mad Men","Veep","Girls","The Thick of It","Silicon Valley","The Killing","House of Cards","Homeland","Smash","Borgen","Transparent","The Man From U.N.C.L.E.","48 Hours Mystery","Better Call Saul","Masterminds","Inside Amy Schumer","Billions","Louie","W1A","Vanity Fair Confidential","Twin Peaks","Black Mirror","Getting On","Mindhunter","Boss","American Greed","The Knick","2016 Olympic Games"];
      const bookPlayData = ["Moneyball","Zen and the Art of Motorcycle Maintenance","The Library","By The Way, Meet Vera Stark","The Mousetrap"];

      movieData.sort(this.sortTitles);
      tvData.sort(this.sortTitles);

      // frequent authors
      const authorList = authors.map((item, i) => {
        let title = item.toString().toLowerCase();

        let itemClass = "";

        if (title===highlightedItem) {
          itemClass+="highlight ";
        }

        let element = <li key={i}
                          className={itemClass}
                          onClick={() => setHighlight(title, "credit", "Author")}>{toTitleCase(item)}</li>;
        return element;
      }, this);

      // frequent books, plays
      const bookPlayList = bookPlayData.map((item, i) => {
        let title = item.toString().toLowerCase();
        let itemClass = "";
        const itemHighlighted = (title===highlightedItem);

        if (title===highlightedItem) {
          itemClass+="highlight ";
        }

        let element = <li key={i}
                          className={itemClass}
                          onClick={() => setHighlight(title, "title", "book")}>
                        {toTitleCase(item)}
                        {/* (itemHighlighted) ? <a href="#" onClick={() => setHighlight(" ", "title", " ")}>✕</a> : null */}
                      </li>;
        return element;
      }, this);


      // Soderbergh buttons
      const soderberghList = soderberghFilms.map((item, i) => {
        let title = item.toString().toLowerCase();
        let itemClass = "";
        const itemHighlighted = (title===highlightedItem);

        if (itemHighlighted) {
          itemClass+="highlight ";
        }

        let element = <li key={i}
                          className={itemClass}
                          onClick={() => setHighlight(title, "title", "movie")}>
                          {toTitleCase(item)}
                          {/* (itemHighlighted) ? <a href="#" onClick={() => setHighlight("", "title", "")}>✕</a> : null */}
                      </li>;
        return element;
      }, this);

      // movie buttons
      const movieList = movieData.map((item, i) => {
        const title = item.toString().toLowerCase();
        let itemClass = "";
        const itemHighlighted = (title===highlightedItem);

        if (itemHighlighted) {
          itemClass+="highlight ";
        }

        let element = <li key={i}
                          className={itemClass}
                          onClick={() => setHighlight(title, "title", "movie")}>
                        {toTitleCase(item)}
                        {/*(itemHighlighted) ? <a href="#" onClick={() => this.props.setHighlight("", "title", "")}>✕</a> : null */}
                      </li>;
        return element;
      }, this);

      // tv buttons
      const tvList = tvData.map((item, i) => {
        const title = item.toString().toLowerCase();
        let itemClass = "";
        const itemHighlighted = (title===highlightedItem);

        if (itemHighlighted){
          itemClass+="highlight ";
        }

        let element = <li key={i}
                        className={itemClass}
                        onClick={() => setHighlight(title, "title", "tv")}
                      >
                        {toTitleCase(item)}
                        {/* (itemHighlighted) ? <span onClick={() => setHighlight("", "title", "")}>✕</span> : null */}
                      </li>;
        return element;
      }, this);

    return (
      <div className={compactMode ? 'hide-buttons most-seen-read' : 'show-buttons most-seen-read'}>
        {/* <span className='top-title-type'>Highlight </span>
        <ul>
          <li>Film</li>
          <li>TV</li>
          <li>Books</li>
          <li>Plays</li>
          <li>Principal photography</li>
          <li>Other</li>
        </ul> */}
        <h2>Most frequently seen, read</h2>

        <span className='top-title-type'>Soderbergh projects</span>
        <ul className={''}>
          {soderberghList}
        </ul>

        <span className='top-title-type'>
          <a href="#" onClick={() => this.toggleMediaHighlight("movie")}>{highlightMediaType==="movie" ? <span className="selected">Movies ✕</span> : <span>Movies</span>}
          </a>
        </span>
        <ul className={''}>
          {movieList}
        </ul>
        <span className='top-title-type'>
          <a href="#" onClick={() => this.toggleMediaHighlight("tv")}>
          {highlightMediaType==="tv" ? <span className="selected">TV ✕</span> : <span>TV</span>}
          </a>
        </span>
        <ul className={''}>
          {tvList}
        </ul>
        <span className='top-title-type'>
          <a href="#" onClick={() => this.toggleMediaHighlight("book")}>
          {highlightMediaType==="book" ? <span className="selected">Books  ✕</span> : <span>Books</span>}
          </a>
          <a href="#" onClick={() => this.toggleMediaHighlight("play")}>
            {highlightMediaType==="play" ? <span className="selected">Plays  ✕</span> : <span>Plays</span>}
          </a>
        </span>
        <ul className={''}>
          {bookPlayList}
        </ul>
        <span className='top-title-type'>Authors</span>
        <ul className={''}>
          {authorList}
        </ul>
      </div>
    );
  }
}
