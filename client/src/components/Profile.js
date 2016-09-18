import React from 'react';
import UserDetails from './UserDetails';
import Feed from './Feed';

const Profile = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      posts: []
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

  onCreate: function(post) {
    this.setState({
      posts: [post, ...this.state.posts]
    });
  },

  render: function() {
    this.getPosts(this.props.user_id);

    return (
      <div className='profile container'>
        <UserDetails user={this.props.user_id} />
        <Feed posts={this.state.posts} onCreate={this.onCreate} />
      </div>
    );
  }
});

export default Profile;
