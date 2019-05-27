<template>
  <v-container>

    <router-link to="/ticket-shop" class="v-btn action-btn">Back</router-link>

    <v-flex class="mb-4">
      <v-avatar size="126" class="mr-4">
       <img src="../../../../checker/1.jpg">
      </v-avatar>
      <v-btn @click="changeAvatar">Change Avatar</v-btn>
    </v-flex>

    <div>Username: </div>
    <div>Role: user/premium/admin</div>
    <div>Phone: </div>

    <v-btn
      class="btn btn-sm btn-secondary action-btn">
      Update Profile Info
    </v-btn>

  </v-container>
</template>



<script>
  export default{

    methods: {
          changeAvatar(){

          },
    }

  }

</script>
