import React from 'react';
import UserDetails from './UserDetails';
import Feed from './Feed';
import { getCookie } from '../helpers';

const Profile = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      posts: [],
      following: false
    };
  },

  getPosts: function(user_id) {
    if (this.state.posts.length === 0) {
      // change url to         window.location.href + 'users/user'          for prod
      fetch(`http://localhost:3005/users/${user_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        return response.json();
      })
      .then(profile => {
        return profile.posts;
      })
      .then(result => {
        return Promise.all(
          result.map(post => {
            return fetch(`http://localhost:3005/post?post_id=${post}&user_id=${user_id}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              return response.json();
            });
          })
        );
      })
      .then(result => {
        this.setState({
          posts: result
        });
      });
    }
  },

  followUser: function(e) {
    e.preventDefault()
    if (!this.state.following) {
      fetch(`http://localhost:3005/users/${this.props.user_id}/follow`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: getCookie('logged_in_user_id')
        })
      })
      .then(response => {
        return response;
      })
      .then(json => {
        this.checkIfFollowing();
      });
    }
  },

  onCreate: function(post) {
    this.setState({
      posts: [post, ...this.state.posts]
    });
  },

  checkIfFollowing: function() {
    const logged_in_user_id = getCookie('logged_in_user_id');
    if (!this.state.following) {
      fetch(`http://localhost:3005/users/${logged_in_user_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        return response.json();
      })
      .then(profile => {
        console.log(profile.following);
        if (profile.following.indexOf(this.props.user_id) > -1) {
          this.setState({
            following: true
          });
        }
      });
    }
  },

  render: function() {
    this.getPosts(this.props.user_id);
    this.checkIfFollowing();
    let followingUser = this.state.following;
    let followText;
    if (followingUser) {
      followText = 'Following';
    } else {
      followText = 'Follow';
    }
    return (
      <div className='profile container'>
        <button
          className={`follow button ${followingUser ? 'button-primary' : ''}`}
          onClick={this.followUser}
          disabled={followingUser}>{followText}</button>
        <UserDetails
          user_id={this.props.user_id}
          username={this.props.username} />
        <Feed posts={this.state.posts} onCreate={this.onCreate} />
      </div>
    );
  }
});

export default Profile;
