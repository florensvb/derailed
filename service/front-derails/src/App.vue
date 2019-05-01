<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>DErAileD</span>
        <span class="font-weight-light"> ENOWARS DESIGN</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <LandingPage/>
    </v-content>
  </v-app>
</template>

<script>
import LandingPage from './components/LandingPage'

export default {
  name: 'App',
  components: {
    LandingPage,
  },
  data () {
    return {
      //
    }
  }
}
</script>
