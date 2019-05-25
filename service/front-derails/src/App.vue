<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase row">
        <span>DErAileD</span>
        <span class="font-weight-light"> ENOWARS DESIGN</span>
      </v-toolbar-title>
      <v-img
        :src="require('./assets/logo.svg')"
        class="ml-4 mb-2"
        contain
        height="50"
      ></v-img>
    </v-toolbar>

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
      //
    }
  },
}
</script>
