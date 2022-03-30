<template>
  <v-app class="pa-8">
    <PasswordInput
      v-model="password"
      @rejected="isPasswordAccepted = false"
      @accepted="isPasswordAccepted = true"
    />
  </v-app>
</template>

<script>
import PasswordInput from "./components/PasswordInput.vue";
export default {
  name: "App",

  components: {
    PasswordInput,
  },

  data() {
    return {
      password: "",
      isPasswordAccepted: false
    };
  },
};
</script>
