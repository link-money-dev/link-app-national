// 第三方应用列表界面
<template>
  <div class="page" dark>
    <toolbar :title="$t('Title.ThirdApp')" :showbackicon="true"  @goback="back"
      :shadow="false" lockpass  ref="toolbar">
      <!--右侧打开设置界面-->
      <v-btn icon slot='right-tool' @click="toSetting">
        <i class="material-icons">extension</i>
      </v-btn>
    </toolbar>

    <v-container fluid v-bind="{ [`grid-list-md`]: true }">
      <div class="dapp-subtitle subheading pl-2">{{$t('hot_dapp')}}</div>
      <card padding="8px 0" margin="0 0" v-if="working">
        <div class="mt-5 textcenter">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </card>
      <card class="server-apps-layout" padding="8px 8px" margin="0 0" v-if="!working && err">
        <p v-if="err">
          {{$t(err)}}
        </p>
      </card>
      <v-layout class="server-apps-layout" row wrap  v-if="!working && apps && apps.length > 0">
        <v-flex
          xs4
          v-for="(app,index) in apps"
          :key="index"
          @click="choose(app)"
          class="app-card-wrapper"
        >
          <v-card flat tile class="pa-2 textcenter app-card" >
             <div class="pa-3">
                <v-avatar class="grey darken-4 app-avatar" :size="`100%`">
                 <img :src="app.image">
                </v-avatar>
             </div>
             <v-card-title primary-title class="app-title">
               <div class="textcenter" style="width: 100%;">{{app.title}}</div>
             </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>


      <div class="dapp-subtitle subheading  pl-2" v-if="myapps.length > 0">{{$t('CustomDApp')}}</div>

      <v-layout class="apps-layout" row wrap  v-if="myapps.length > 0">
        <v-flex
          xs4
          v-for="(app,index) in myapps"
          :key="index"
          @click="choose(app)"
          class="app-card-wrapper"
        >
          <v-card dark flat tile class="pa-2 textcenter app-card" >
            <div class="pa-3">
              <v-avatar class="grey darken-4 app-avatar" :size="`62px`">
               <span class="white--text headline">{{app.title.substring(0,1)}}</span>
             </v-avatar>
            </div>
             <v-card-title primary-title class="app-title">
               <div class="textcenter" style="width: 100%;">{{app.title}}</div>
             </v-card-title>
          </v-card>
        </v-flex>
        <v-flex
          xs4
          @click="addDapp"
          class="app-card-wrapper"
        >
          <v-card dark flat tile class="pa-2 textcenter app-card mt-3" >
            <div class="pa-3">
              <v-avatar class="grey darken-4 app-avatar add-app-avatar" :size="`62px`">
               <v-icon :size="`38px`" color="primary">add</v-icon>
             </v-avatar>
            </div>
          </v-card>
        </v-flex>
      </v-layout>

    <v-dialog v-model="showConfirmDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Third.OpenAppHint',[choosed.title])}}</div>
          <div class="btns flex-row">
            <div class="flex1 skip-red textcenter" @click="openApp">{{$t('Button.OK')}}</div>
            <div class="flex1 skip-red textcenter" @click="showConfirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>

    <!--新增弹窗-->
    <v-dialog v-model="showAddDlg" persistent max-width="90%">
      <v-card>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>

              <v-flex xs12 sm6 md4>
                <v-text-field :label="$t('ContactAdd.name')" clearable required v-model="apptitle"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field :label="$t('ContactAdd.address')" clearable required v-model="appsite"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" :loading="addingApp" flat @click.stop="cancelAddApp">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="error darken-1" :loading="addingApp" flat @click.stop="doAddApp">{{$t('Save')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    </v-container>

    <send-asset v-if="showSendAsset"
      :destination="sendTarget.destination"
      :appname="choosed.title"
      :asset_code="sendTarget.code"
      :asset_issuer="sendTarget.issuer"
      :memo_type="sendTarget.memo_type"
      :memo="sendTarget.memo"
      :amount="sendTarget.amount"
      :pathPayment="pathPayment"
      @exit="exitSendAsset"
      @sendsuccess="sendAssetSuccess"
       ></send-asset>
    <back-up-data v-if="appEventType === 'backup' && appEventData"
      :appname="choosed.title"
      @exit="exitBackUpEvent" @success="successBackUpEvent" />

    <recovery-data v-if="appEventType === 'recovery' && appEventData"
      :appname="choosed.title" :encryptData="appEventData.data"
      @exit="exitRecoveryEvent" @success="successRecoveryEvent" />

    <trust-line v-if="appEventType === 'trust' && appEventData"
      :appname="choosed.title"
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      @exit="exitTrustEvent" @success="successTrustEvent" />

    <sign-x-d-r v-if="appEventType === 'signXDR' && appEventData"
      :appname="choosed.title"
      :message="appEventData.message"
      :xdr="appEventData.data"
      @exit="exitSignXDREvent"
      @success="successSignXDREvent"
      />

  </div>
</template>

<script>
const thridAppConfig = `https://update.fchain.io/config/dapp.json`
import axios from 'axios'
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import  defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,FFW_EVENT_TYPE_SIGNXDR } from '@/api/ffw'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'

// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      apps: [],
      working: false,
      err: null,
      showConfirmDlg: false,
      choosed: {}, //当前选中的app
      showSendAsset: false,
      sendTarget:{},
      pathPayment: true,//发送功能是否支持pathPayment
      appInstance: null,

      appEventType: null,//接收到的appevent事件
      appEventData: null,//接收的appevent的data

      showAddDlg: false,
      apptitle: null,
      appsite: null,
      addingApp: false,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
      myapps: state => state.app.myapps,
    }),
  },
  beforeMount () {
    this.working = true
    this.err = null
    axios.get(thridAppConfig)
      .then(response=>{
        this.working = false
        //console.log(response)
        this.apps = response.data.apps
        // this.apps = [{site: '111',title: 'aaa'}]
      })
      .catch(err=>{
        this.working = false
        console.error(err)
        this.err = 'Error.AjaxTimeout'
      })
  },
  mounted () {
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
    }
  },
  methods: {
    ...mapActions(['addMyApp']),
    back(){
      this.$router.back()
    },
    choose(app){
      this.choosed = app
      let val = localStorage.getItem(app.site)
      if(val){
        this.openApp()
        return
      }
      this.showConfirmDlg = true

    },
    openApp(){
      localStorage.setItem(this.choosed.site, "confirm")
      this.showConfirmDlg = false
      if(cordova.platformId === 'browser'){
        this.appInstance = cordova.InAppBrowser.open(this.choosed.site, '_blank', 'location=yes,toolbar=yes,toolbarcolor=#cfa15a');
      }else{
        this.appInstance = cordova.ThemeableBrowser.open(this.choosed.site, '_blank', {
              statusbar: {
                  color: '#cfa15a'
              },
              toolbar: {
                  height: 44,
                  color: '#cfa15a'
              },
              browserProgress: {
                showProgress: true,
                progressBgColor: "#007e9c",
                progressColor: "#FF5E00"
              },
              title: {
                  color: '#FFFFFF',
                  showPageTitle: true,
                  staticText: this.choosed.title
              },
              closeButton: {
                  image: 'close',
                  imagePressed: 'close_pressed',
                  align: 'left',
                  event: 'closePressed'
              },
              backButtonCanClose: true,
              // hidden: true
          })

      }
      this.appInstance.addEventListener('reloadPressed', e => {
        this.appInstance.reload()
      })
      this.appInstance.addEventListener('sharePressed', e => {
          this.shareCB(e.url)
      })
      // this.appInstance.removeEventListener('closePressed')
      this.appInstance.addEventListener('closePressed',()=>{
        this.appInstance.close()
        this.appInstance = undefined
      })
      this.appInstance.addEventListener('loadstop',() => {
        //let script = `if(!window.FFW){window.FFW = {};FFW.address = "${this.account.address}";FFW.pay = function(destination,code,issuer,amount,memo_type,memo){ var params = { type:'pay',destination: destination, code: code, issuer: issuer, amount: amount, memo_type: memo_type, memo: memo };cordova_iab.postMessage(JSON.stringify(params));};};`
        //let scriptEle = `if(!window.FFW){var script = document.createElement('script');script.setAttribute('type', 'text/javascript');script.text = "${script}";document.body.appendChild(script);}`
        //alert(scriptEle)
        let contacts = this.allcontacts
        let myaddresses = this.myaddresses
        let isIos = "ios" === cordova.platformId
        let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, cordova.platformId)
        // alert(script)
        this.appInstance.executeScript({ code: script },params => {
          //console.log(params)
          //alert('after script insert')
          //alert(params)
        })

      })
      let that = this
      this.appInstance.addEventListener('message', debounce(function (e){
        console.log('-----------get message ---- ')
        console.log(JSON.stringify(e))
       // alert(JSON.stringify(e))
        let type = e.data.type
        if(type === FFW_EVENT_TYPE_PAY){
          this.doPayEvent(e)
        }else if(type === FFW_EVENT_TYPE_PATHPAYMENT){
          that.doPathPaymentEvent(e)
        }else if(type === FFW_EVENT_TYPE_SIGN){
          that.appEventType = e.data.type
          that.appEventData = e.data
          that.doSign(e)
        }else{
          that.appEventType = e.data.type
          that.appEventData = e.data
          that.hideDapp()
        }
      },3000))
    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
    },
    doPayEvent(e){
      try{
        this.showSendAsset = true
        this.sendTarget = e.data
        this.pathPayment = false
        this.appInstance.hide()
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    doSign(e){
      //签名
      let data = e.data.data
      if(!isJson(data)){
        return this.doCallbackEvent(this.callbackData('fail','data is invalid'))
      }
      if(data){
        let cdata = signToBase64(this.accountData.seed, data)
        console.log('---------------encrypt data---' + cdata)
       // alert('sign---'+cdata)
        this.doCallbackEvent(this.callbackData('success', 'success', cdata))
      }else{
       // alert('sign-fail--')
        this.doCallbackEvent(this.callbackData('fail','no data to sign'))
      }
    },
    doPathPaymentEvent(e){
      try{
        this.showSendAsset = true
        this.sendTarget = e.data
        this.pathPayment = true
        this.appInstance.hide()
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    doCallbackEvent(data){
      console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let code = `FFW.callback("${cb}",{code: "${data.code}",message:"${data.message}",data:"${data.data}"})`
          console.log('===============callback------event---')
          console.log(code)
          this.appInstance.executeScript({
            code: code },
            params=>{})
        }catch(err){
          console.error(err)
        }
      }
    },
    callbackData(code,message,data){
      // return JSON.stringify({code,message,data})
      return {code,message,data}
    },
    exitSendAsset(){
      this.showSendAsset = false
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('fail','cancel payment'))
    },
    sendAssetSuccess(){
      this.showSendAsset = false
      this.appInstance.show()
      //TODO 怎么通知应用
      this.doCallbackEvent(this.callbackData('success','success'))
    },
    shareCB(url){
      let options = {
        subject: this.choosed.title,
        url: url,
        chooserTitle: this.$t('Share')
      }
      window.plugins.socialsharing.shareWithOptions(options, result=>{
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      }, msg=>{
        console.log("Sharing failed with message: " + msg);
      });
    },
    exitEvent(msg){
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('fail',msg))
      this.$nextTick(()=>{
        this.appEventType = null
        this.appEventData = null
      })
    },
    successEvent(msg='success',data){
      //alert('----success--event---'+ JSON.stringify(data))
      this.appInstance.show()
      this.doCallbackEvent(this.callbackData('success',msg, data))
      this.$nextTick(()=>{
        this.appEventType = null
        this.appEventData = null
      })
    },
    exitBackUpEvent(){
      this.exitEvent('cancel back up')
    },
    successBackUpEvent(data){
      this.successEvent('success',data)
    },
    exitRecoveryEvent(){
      this.exitEvent('cancel recovery')
    },
    successRecoveryEvent(){
      this.successEvent()
    },
    exitTrustEvent(){
      this.exitEvent('cancel trust')
    },
    successTrustEvent(){
      this.successEvent()
    },
    exitSignXDREvent(){
      //alert('----exit---signxdr---')
      this.exitEvent('cancel signxdr')
    },
    successSignXDREvent(data){
      //alert('-----signxdr-success---')
      this.successEvent('success',data)
    },
    toSetting(){
      this.$router.push({name: 'DAppSetting'})
    },
    addDapp(){
      this.showAddDlg = true
      this.apptitle = null
      this.appsite = null
    },
    cancelAddApp(){
      this.showAddDlg = false
      this.apptitle = null
      this.appsite = null
    },
    doAddApp(){
      if(this.addingApp)return
      if(!this.apptitle)return
      if(!this.appsite)return
      this.addingApp = true
      this.addMyApp({title: this.apptitle, site: this.appsite})
        .then(response=>{
            this.cancelAddApp()
            this.addingApp = false
          })
          .catch(err=>{
            this.$toasted.error(this.$t('SaveFailed') +":" + (err.message ? err.message:''))
          })


    }



  },
  components: {
    Toolbar,
    Loading,
    Card,
    SendAsset,
    TrustLine,
    RecoveryData,
    BackUpData,
    SignXDR,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $secondarycolor.gray
.app-title
  padding: .1rem .1rem
  overflow: hidden
  white-space: nowrap
  font-size: 14px
.card-content
  padding: 20px 10px
.t2
  font-size: 16px
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray
  color: $primarycolor.red

.server-apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px

.apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px
.app-card
  background: $secondarycolor.gray!important
.app-card-wrapper
  border: 1px solid $primarycolor.gray!important
.app-avatar
  border-radius: 50%!important
.dapp-subtitle
  color: $secondarycolor.font
.add-app-avatar
  background: $secondarycolor.gray!important
</style>
