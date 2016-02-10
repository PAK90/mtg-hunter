import * as React from "react";

import Searchkit from "searchkit";

require('./style.scss');

const host = "https://kili-eu-west-1.searchly.com/movies/";
const sk = new Searchkit.SearchkitManager(host, {
    multipleSearchers:false,
    basicAuth:"read:teetndhjnrspbzxxyfxmf5fb24suqxuj"
});


class MovieHits extends Searchkit.Hits {
    renderResult(result:any) {
        let url = "http://www.imdb.com/title/" + result._source.imdbId;
        return (
            <div className={this.bemBlocks.item().mix(this.bemBlocks.container("item"))} key={result._id}>
                <a href={url} target="_blank">
                    <img className={this.bemBlocks.item("poster")} src={result._source.poster} width="100" height="140"/>
                    <div className={this.bemBlocks.item("title")}>{result._source.title}</div>
                </a>
            </div>
        );
    }
}

class Application extends React.Component {
    render() {
        const SearchkitProvider = Searchkit.SearchkitProvider;
        const Searchbox = Searchkit.SearchBox;
        const Hits = Searchkit.Hits;
        return (<div>

            <SearchkitProvider searchkit={sk}>
                <div className="search">
                   <div className="search__query">
                   <Searchbox searchOnChange={true} prefixQueryFields={["actors^1","type^2","languages","title^10"]} />
                   </div>
                   <div className="search__results">
                   <MovieHits hitsPerPage={6}/>
                   </div>
                </div>
            </SearchkitProvider>

        </div>);
    }
}

ReactDOM.render(<Application />, document.getElementById('app'));
