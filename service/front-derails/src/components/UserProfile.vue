<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center>
      <v-flex xs6>
        <v-flex xs12>
          <v-avatar size="126">
            <img src="../../../../checker/1.jpg">
          </v-avatar>
        </v-flex>
        <v-flex xs12>
          <v-btn @click="changeAvatar">
            Change Avatar
          </v-btn>
        </v-flex>
      </v-flex>

      <v-flex xs6>
        <v-card>
          <v-card-title>

            <v-card-text>
              Username: {{userInfo.username}}
            </v-card-text>

            <v-card-text v-if="userInfo && userInfo.user_role">
              Role: {{userInfo.user_role}}
            </v-card-text>

            <v-card-text v-if="userInfo && userInfo.phone_number">
              Phone: {{userInfo.phone_number}}
            </v-card-text>

            <v-card-text v-if="userInfo && userInfo.updated_at">
              Updated: {{require('moment')(userInfo.updated_at).calendar()}}
            </v-card-text>

          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>

    <br/>

    <v-flex xs12>
      <v-btn @click="back">
        Back
      </v-btn>
      <v-btn>
        Update Profile Info
      </v-btn>
    </v-flex>

  </v-container>
</template>

<script>
  export default{
    data() {
      return {
        userInfo: {},
        loading: false,
      }
    },
    mounted () {
      this.getUserInfo();
    },
    methods: {
          async getUserInfo () {
            this.loading = true;
            try {
              const { data: user } = await this.$axios.get('/user-profile');
              this.userInfo = user;
            } catch (e) {
              // err
            }
            this.loading = false;
          },
          changeAvatar(){
             // upload image/string
          },
          back(){
            this.$router.push('/ticket-shop')
          },
    }

  }

</script>
