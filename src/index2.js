import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
//import "./styles/customisations.scss";

var firebase = require('firebase');
var firebaseui = require('firebaseui');
var Jumbotron = require('react-bootstrap/lib/Jumbotron');
var Button = require('react-bootstrap/lib/Button');
var Nav = require('react-bootstrap/lib/Navbar').Nav;
var NavItem = require('react-bootstrap/lib/Navbar').NavItem;
var NavDropdown = require('react-bootstrap/lib/Navbar').NavDropdown;
var Navbar = require('react-bootstrap/lib/Navbar');
var MenuItem = require('react-bootstrap/lib/Button').MenuItem;

export class App extends React.Component<any, any> {

  	constructor() {
	    super();
	    const host = "http://192.168.1.119:9200/testcards/card";
	    //this.searchkit = new SearchkitManager(host);
	    this.state = {hoveredId: '',
		    showModal: false,
		    clickedCard: '',
		    matchPercent: '100%',
		    all: 'collapse',
		    powerOperator: "AND",
		    toughnessOperator: "AND",
		    symbolsOperator: "AND",
		    manaCostOperator: "AND",
		    coloursOperator: "AND",
		    colourIdentityOperator: "AND",
		    colourCountOperator: "AND",
		    rarityOperator: "AND",
		    supertypeOperator: "AND",
		    typeOperator: "AND",
		    subtypeOperator: "AND",
		    artistsOperator: "AND",
		    setcodesOperator: "AND",
		    formatsOperator: "AND",
		    functiontagsOperator: "AND",
		    cyclesOperator: "AND",
		    rulesTextOperator: "AND",
		    coloursOnly: false,
		    colourIdentityOnly: false};
	    // Bind the prop function to this scope.
	    //this.handleClick = this.handleClick.bind(this);
	}

	onSignout() {
		firebase.auth().signOut();
		console.log("signed out!");
	}

	render() {
		var config = {
	    	apiKey: "AIzaSyDd_EVNjL7-FnSW5XsYbUtVSWWh93DJBw4",
	    	authDomain: "mtg-hunter.firebaseapp.com",
	    	databaseURL: "https://mtg-hunter.firebaseio.com",
	    	storageBucket: "mtg-hunter.appspot.com",
	    	messagingSenderId: "699608148386"
	    };
	    firebase.initializeApp(config);

	    // Initialize the FirebaseUI Widget using Firebase.
	    var ui = new firebaseui.auth.AuthUI(firebase.auth());

	    var uiConfig = {
	      	'signInSuccessUrl': '/',
	      	'signInOptions': [
	        // Leave the lines as is for the providers you want to offer your users.
		        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
		        firebase.auth.GithubAuthProvider.PROVIDER_ID,
		        firebase.auth.EmailAuthProvider.PROVIDER_ID
		    ],
		    'signInFlow': 'popup'
	    };
	    /*ui.start('#firebaseui-auth-container', uiConfig);

	    firebase.auth().onAuthStateChanged(function(user) {
	        if (user) {
	            // User is signed in.
	            var displayName = user.displayName;
	            var email = user.email;
	            var emailVerified = user.emailVerified;
	            var photoURL = user.photoURL;
	            var uid = user.uid;
	            var providerData = user.providerData;
	            user.getToken().then(function(accessToken) {
	        	    document.getElementById('sign-in-status').textContent = 'Signed in';
	            	document.getElementById('sign-in').textContent = 'Sign out';
	              	document.getElementById('account-details').textContent = JSON.stringify({
		                displayName: displayName,
		                email: email,
		                emailVerified: emailVerified,
		                photoURL: photoURL,
		                uid: uid,
		                accessToken: accessToken,
		                providerData: providerData
	              	}, null, '  ');
	            });
	        } else {
	            // User is signed out.
	            document.getElementById('sign-in-status').textContent = 'Signed out';
	            document.getElementById('sign-in').textContent = 'Sign in';
	            document.getElementById('account-details').textContent = 'null';
	        }
	    }, function(error) {
	        console.log(error);
	    });*/

	    return (
	    	<div>
	    	<Navbar inverse collapseOnSelect>
			    <Navbar.Header>
			      <Navbar.Brand>
			        <a href="#">React-Bootstrap</a>
			      </Navbar.Brand>
			      <Navbar.Toggle />
			    </Navbar.Header>
			    <Navbar.Collapse>
			      <Nav>
			        <NavItem eventKey={1} href="#">Link</NavItem>
			        <NavItem eventKey={2} href="#">Link</NavItem>
			        <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
			          <MenuItem eventKey={3.1}>Action</MenuItem>
			          <MenuItem eventKey={3.2}>Another action</MenuItem>
			          <MenuItem eventKey={3.3}>Something else here</MenuItem>
			          <MenuItem divider />
			          <MenuItem eventKey={3.3}>Separated link</MenuItem>
			        </NavDropdown>
			      </Nav>
			      <Nav pullRight>
			        <NavItem eventKey={1} href="#">Link Right</NavItem>
			        <NavItem eventKey={2} href="#">Link Right</NavItem>
			      </Nav>
			    </Navbar.Collapse>
			  </Navbar>
			  </div>
	    );
	}
}

ReactDOM.render(<App />, document.getElementById('app'));