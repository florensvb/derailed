<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center>
      <v-flex xs6>
        <v-flex xs12>
          <v-avatar size="126">
            <img v-if="user && user.avatar" v-bind:src="avatarPath"/>
            <img v-else src="@/assets/potato.jpg"/>
          </v-avatar>
        </v-flex>
        <v-flex xs12>
          <input type="file" accept="image/*" @change="changeAvatar">
        </v-flex>
      </v-flex>

      <v-flex xs6>
        <v-card>
          <v-card-title>

            <v-card-text>
              Username: {{user.username}}
            </v-card-text>

            <v-card-text v-if="user && user.user_role">
              Role: {{user.user_role}}
            </v-card-text>

            <v-card-text v-if="user && user.phone_number">
              Phone: {{user.phone_number}}
            </v-card-text>

            <v-card-text v-if="user && user.updated_at">
              Updated: {{require('moment')(user.updated_at).calendar()}}
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
        user: {},
        loading: false,
      }
    },
    mounted () {
      this.getUser();
    },
    computed: {
      avatarPath() {
        if (!this.user || !this.user.avatar) return;
        return `${process.env.VUE_APP_API_URL}/user-avatar/${this.user.avatar}?token=${localStorage.token}`;
      },
    },
    methods: {
          async getUser () {
            this.loading = true;
            try {
              const { data: user } = await this.$axios.get('/user-profile');
              this.user = user;
            } catch (e) {
              // err
            }
            this.loading = false;
          },
          async changeAvatar(e){
              const file = e.target.files[0];
              const formData = new FormData();
              formData.append('avatar', file);
              const { data: user } = await this.$axios.post('/user-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
              this.user = user;
          },
          back(){
            this.$router.push('/ticket-shop')
          },
    }

  }

</script>
