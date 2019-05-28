<template>
  <v-container>

    <v-btn
      @click="back"
    >
      Back
    </v-btn>

    <v-flex class="mb-4">
      <v-avatar size="126" class="mr-4">
       <img src="../../../../checker/1.jpg">
      </v-avatar>
      <v-btn
        @click="changeAvatar"
      >
        Change Avatar
      </v-btn>
    </v-flex>

    <v-card>
      <v-card-title
        primary-title class="headline black">

        <v-card-text>
          Username: {{userInfo.username}}
        </v-card-text>

        <v-card-text>
          Role: {{userInfo.user_role}}
        </v-card-text>

        <v-card-text>
          Phone: {{userInfo.phone_number}}
        </v-card-text>

        <v-card-text>
          Updated At: {{userInfo.updated_at}}
        </v-card-text>

      </v-card-title>
    </v-card>

    <v-btn
      class="btn btn-sm btn-secondary action-btn"
    >
      Update Profile Info
    </v-btn>

  </v-container>
</template>



<script>
  export default{
    data() {
      return {
        userInfo: {},
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
