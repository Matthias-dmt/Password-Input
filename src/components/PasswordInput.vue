<template>
  <v-app>
    <v-form
      :class="`pa-10 ${styles.container}`"
      ref="form"
      @submit.prevent="verifyPassword"
    >
      <!-- INPUT -->
      <section :class="`${styles.inputs.container}`">
        <v-text-field
          :class="`mb-3 ${styles.inputs.passwordInput}`"
          :value="innerPassword"
          @input="updateValue($event)"
          :rules="[
            inputRules.required,
            inputRules.minLength,
            inputRules.noSpace,
          ]"
          :type="showPassword ? 'text' : 'password'"
          clearable
          dense
          autocomplete
          :label="inputLabels.passwordLabel"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        />
        <v-text-field
          v-model="passwordCopy"
          :class="`mb-3 ${styles.inputs.repeatPasswordInput}`"
          :label="inputLabels.repeatPasswordLabel"
          :rules="[inputRules.required, inputRules.isSame]"
          clearable
          :type="showPassword ? 'text' : 'password'"
          dense
          autocomplete
        />

        <!-- PASSWORD STRENGHT -->
        <div
          v-if="passwordStrenght"
          :class="`mb-6 ${styles.inputs.passwordStrenght.container}`"
        >
          <v-progress-linear
            :value="passwordStrenght.progress"
            :color="passwordStrenght.color"
            height="7"
            :class="`mb-2 ${styles.inputs.passwordStrenght.linearProgress}`"
          />
          {{ passwordStrenght.text }}
        </div>
      </section>

      <!-- ACTION BUTTON -->
      <section
        :class="`d-flex justify-between align-center flex-wrap flex-md-nowrap ${styles.buttons.container}`"
      >
        <div :class="`mr-4 p-0 ${styles.buttons.saveButton}`">
          <v-btn type="submit" elevation="2">Save Password</v-btn>
        </div>
        <div :class="`${styles.buttons.generateRandomButton}`">
          <v-btn elevation="2" @click="generateRandomPassword">
            Generate Random Password
          </v-btn>
        </div>
      </section>

      <!-- SNACKBAR -->
      <v-snackbar
        v-if="snackBarInfos"
        v-model="snackbar"
        :color="snackBarInfos.status"
        :class="`${snackbar}`"
        shaped
      >
        {{ snackBarInfos.msg }}

        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" rounded @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-form>
  </v-app>
</template>

<script>
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_STRENGHT = {
  low: {
    color: "error",
    progress: 25,
    text: "Low Strength Password",
  },
  medium: {
    color: "orange",
    progress: 50,
    text: "Medium Strength Password",
  },
  strong: {
    color: "yellow darken-1",
    progress: 75,
    text: "Strong Strength Password",
  },
  veryStrong: {
    color: "success",
    progress: 100,
    text: "Very Strong Strength Password",
  },
};

export default {
  name: "PasswordInput",

  props: {
    password: {
      type: String,
      default: "",
    },
    inputLabels: {
      type: Object,
      default: () => ({
        passwordLabel: "Password",
        repeatPasswordLabel: "Repeat Password",
      }),
    },

    styles: {
      type: Object,
      default: () => ({
        container: "",
        inputs: {
          container: "",
          passwordInput: "",
          repeatPasswordInput: "",
          passwordStrenght: {
            container: "",
            linearProgress: "",
          },
        },
        buttons: {
          container: "",
          saveButton: "",
          generateRandomButton: "",
        },
        snackbar: "",
      }),
    },
  },

  data() {
    return {
      innerPassword: this.password,
      passwordCopy: "",
      showPassword: false,

      size: 24,
      characters: "a-z,A-Z,0-9,#",

      inputRules: {
        required: (value) => !!value || "Required.",
        minLength: (value) => {
          if (!value) return "Min 8 characters";
          return value.length >= PASSWORD_MIN_LENGTH || "Min 8 characters";
        },
        noSpace: (value) => {
          if (!value) return "Space is not authorized";
          return (
            (value && !(value.trim().indexOf(" ") >= 0)) ||
            "Space is not authorized"
          );
        },
        isSame: (value) => {
          return value === this.innerPassword || "Passwords are not same.";
        },
      },

      snackBarInfos: null,
      snackbar: false,

      passwordStrenght: null,
      variationsCount: 0,
    };
  },

  methods: {
    updateValue(value) {
      this.$emit("input", value);
      this.innerPassword = value;
      if (value) this.checkPasswordStrenght();
    },

    checkPasswordStrenght() {
      const { innerPassword } = this;
      this.variationsCount = 0;

      if (innerPassword.length < PASSWORD_MIN_LENGTH) {
        this.passwordStrenght = PASSWORD_STRENGHT.low;
        return;
      }

      const passwordVariations = {
        hasNumber: /\d/.test(innerPassword),
        hasLowercase: /[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ]/.test(innerPassword),
        hasUppercase: /[A-ZÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ]/.test(innerPassword),
        hasSpecial: /[!@}{[#$%^&*)(+=._-]/.test(innerPassword),
      };

      for (let check in passwordVariations) {
        this.variationsCount += passwordVariations[check] === true ? 1 : 0;
      }

      console.log(passwordVariations, this.variationsCount);

      switch (this.variationsCount) {
        case 1:
          this.passwordStrenght = PASSWORD_STRENGHT.low;
          return;
        case 2:
        case 3:
          if (!passwordVariations.hasSpecial) {
            this.passwordStrenght = PASSWORD_STRENGHT.medium;
            return;
          }

          this.passwordStrenght = PASSWORD_STRENGHT.strong;
          return;
        case 4:
          this.passwordStrenght = PASSWORD_STRENGHT.veryStrong;
          return;
        default:
          break;
      }

      return true;
    },

    verifyPassword() {
      if (this.$refs.form.validate() === true) {
        this.acceptedPassword();
      } else {
        this.rejectedPassword();
      }
    },

    rejectedPassword() {
      return this.$emit("rejected");
    },

    acceptedPassword() {
      return this.$emit("accepted");
    },

    generateRandomPassword() {
      let charactersArray = this.characters.split(",");
      let CharacterSet = "";
      let password = "";

      if (charactersArray.indexOf("a-z") >= 0) {
        CharacterSet += "abcdefghijklmnopqrstuvwxyz";
      }
      if (charactersArray.indexOf("A-Z") >= 0) {
        CharacterSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      }
      if (charactersArray.indexOf("0-9") >= 0) {
        CharacterSet += "0123456789";
      }
      if (charactersArray.indexOf("#") >= 0) {
        CharacterSet += "![]{}()%&*$#^<>~@|";
      }

      for (let i = 0; i < this.size; i++) {
        password += CharacterSet.charAt(
          Math.floor(Math.random() * CharacterSet.length)
        );
      }
      this.passwordCopy = password;
      this.innerPassword = password;
      this.updateValue(password);
      this.copyToClipboard(password);
    },

    async copyToClipboard(data) {
      try {
        await navigator.clipboard.writeText(data);

        this.snackBarInfos = {
          status: "success",
          msg: "Password copied succefully",
        };
        this.snackbar = true;
        this.resetCopyToClipboard();
      } catch ($e) {
        this.snackBarInfos = {
          status: "error",
          msg: "Something went wrong when try to copy on clipboard",
        };
        this.snackbar = true;
        this.resetCopyToClipboard();
      }
    },

    resetCopyToClipboard() {
      setTimeout(() => (this.snackbar = null), 5000);
    },
  },
};
</script>
