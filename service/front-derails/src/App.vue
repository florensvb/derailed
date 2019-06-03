<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase row">
        <span>DErAileD</span>
        <span class="font-weight-light"> ENOWARS DESIGN</span>
        <v-spacer/>
      </v-toolbar-title>
      <v-btn flat @click="conductor=true">
        <v-img
          :src="require('./assets/logo.svg')"
          class="ml-4 mb-2"
          contain
          height="50"
        ></v-img>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn v-if="$user()" @click="goToUserProfile" flat>User</v-btn>
        <v-btn @click="logout" flat>Logout</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-dialog
      v-model="conductor"
      width="300"
    >
      <v-card class="text-xs-center">
        <v-card-text>
          I am the<b> conductor</b>.
        </v-card-text>
        <v-card-text>
          And I am twelve years old.
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      conductor: false,
    }
  },
  methods: {
    logout() {
      window.localStorage.removeItem('token');
      this.$router.push('/');
    },
    goToUserProfile() {
      this.$router.push('/user-profile');
    }
  },
}
</script>
