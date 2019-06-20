import random
import string
import requests
import piexif
import json
import io
from PIL import Image
from enochecker import *


def random_username():
    return ''.join(random.choice(string.ascii_letters) for _ in range(0, 15))


def random_password():
    rand_symbols = string.ascii_letters + string.digits
    return ''.join(random.choice(rand_symbols) for _ in range(0, 15))


def random_image():
    images = ['1.jpg', '3.jpg', '4.jpg', '5.jpg']
    return random.choice(images)


def random_train_id():
    return random.randint(1, 9)


class DerailedChecker(BaseChecker):
    port = 4303
    flag_count = 2
    noise_count = 2
    havoc_count = 1
    service_name = 'derailed'
    jwt_token = ''
    image = ''
    registered = False

    def url(self):
        return "http://"+self.address+":"+str(self.port)

    def putflag(self):
        try:
            if self.round == 1:
                pwd = self.register('Conductor')[1]
                self.team_db['CondPwd'] = pwd

            if self.flag_idx == 0:
                self.login('Conductor', self.team_db['CondPwd'])
                self.add_ticket()
            elif self.flag_idx == 1:
                username, password = self.register()
                self.login(username, password)
                image = self.input_flag_metadata()
                self.team_db['image'] = {"img": image, "username": username, "password": password}
                self.change_avatar(image)
        except KeyError:
            return BrokenServiceException("Key Error")
        except OfflineException:
            raise BrokenServiceException("Service Offline")

    def getflag(self):
        try:
            if self.flag_idx == 0:
                self.login('Conductor', self.team_db['CondPwd'])
                self.get_tickets()
                self.info("Flag found!")
            elif self.flag_idx == 1:
                avatar = self.team_db['image']["img"]
                username = self.team_db['image']["username"]
                password = self.team_db['image']["password"]
                self.login(username, password)
                image = self.get_avatar()
                # self.read_metadata(image)
                self.info("Flag found!")
        except KeyError:
            raise BrokenServiceException("Key Error")
        except OfflineException:
            raise BrokenServiceException("Service Offline")

    def putnoise(self):
        rand_place = random.randint(0, 0)  # 0, 2
        try:
            if rand_place == 0:
                username, password = self.register()
                self.login(username, password)
                self.add_ticket(self.noise)
            elif rand_place == 1:
                pass
            elif rand_place == 2:
                pass
        except OfflineException:
            raise BrokenServiceException("Service Offline")

    def getnoise(self):
        try:
            pass
        except OfflineException:
            raise BrokenServiceException("Service Offline")

    def havoc(self):
        try:
            methods = [self.check_trains, self.check_conductor_account]
            random.choice(methods)()
        except OfflineException:
            raise BrokenServiceException("Service Offline")

    def exploit(self):
        pass

    '''
    ####################
    #  HELPER METHODS  #
    ####################
    '''

    def register(self, username=None, password=None):
        if not username:
            username = random_username()
        if not password:
            password = random_password()

        data = {'username': username, 'password': password}
        header = {'User-Agent': self.http_useragent_randomize()}
        try:
            register = requests.post(self.url() + "/auth/new", data=data, headers=header)
            if register.ok:
                self.team_db['Username'] = username
                self.team_db['Password'] = password
                self.info("Successfully registered account {}".format(username))
                self.registered = True
            else:
                if register.status_code == 422:
                    self.debug("User {} already exists in db".format(username))
                raise BrokenServiceException('Could not register')
        except requests.exceptions.ConnectionError:
            raise OfflineException
        return [username, password]

    def login(self, username, password):
        data = {'username': username, 'password': password}
        header = {'User-Agent': self.http_useragent_randomize()}

        try:
            login = requests.post(self.url() + "/auth", data=data, headers=header)
            if login.ok:
                jwt_token = login.headers['authorization']
                self.jwt_token = jwt_token
            else:
                self.debug("Could not login as {}, code {}".format(username, login.status_code))
                raise BrokenServiceException("Problem occurred while logging in as {}".format(username))
        except KeyError:
            raise BrokenServiceException("Key Error")
        except Exception:
            raise BrokenServiceException("Problem occurred while logging in as {}".format(username))

    def add_ticket(self, noise=None):
        if self.registered is False:
            uname, pwd = self.register()
            self.login(uname, pwd)

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        if noise:
            data = {'train_id': random_train_id(), 'ticket_id': noise}
        else:
            data = {'train_id': random_train_id(), 'ticket_id': self.flag}

        ticket_flag = requests.post(self.url() + "/add-ticket", data=data, headers=header)
        if not ticket_flag.ok:
            raise BrokenServiceException("Could not add a ticket with the flag")

    def get_tickets(self):
        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        try:
            g = requests.get(self.url() + "/my-tickets", headers=header)
            if self.flag not in g.text:
                raise BrokenServiceException("Flag not found")
            if not g.ok:
                raise BrokenServiceException("Could not retrieve tickets")
        except Exception:
            raise BrokenServiceException("Problem occurred while retrieving own ticket")

    def input_flag_metadata(self):
        zeroth_ifd = {
            piexif.ImageIFD.ImageDescription: self.flag
        }
        exif_dict = {"0th": zeroth_ifd}
        exit_bytes = piexif.dump(exif_dict)
        try:
            image = random_image()
        except IOError:
            self.debug("Image not found")
            return KeyError

        jpg_img = Image.open(image)
        jpg_img.save(image, exif=exit_bytes)
        return image

    def read_metadata(self, image):
        try:
            exif_dict = piexif.load(image)
        except FileNotFoundError:
            raise BrokenServiceException("Image not found")
        for k, v in exif_dict['0th'].items():
            if v.decode("utf-8") == self.flag:
                self.info("Flag successfully retrieved from metadata")
                break
            else:
                self.info("Flag not found in image metadata")
                raise BrokenServiceException("Flag not found in image metadata")

    def change_avatar(self, image):
        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        files = {'avatar': open(image, 'rb')}
        upload_avatar = requests.post(self.url() + "/user-avatar", files=files, headers=header)
        if not upload_avatar.ok:
            raise BrokenServiceException("Could not upload flag image")

    def get_avatar(self):
        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        get = requests.get(self.url() + "/user-profile", headers=header)
        image_info = get.content.decode("utf-8")
        image_name = json.loads(image_info)["avatar"]
        get_avatar = requests.get(self.url() + "/uploads/" + image_name, headers=header)
        image_bytes = get_avatar.content
        image = Image.open(io.BytesIO(image_bytes))
        size = image.size
        image.save("test.jpg")
        return image

    def check_trains(self):
        uname, pwd = self.register()
        self.login(uname, pwd)

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        trains = requests.get(self.url() + "/trains", headers=header)

        if trains.text.count('id') != 9:
            raise BrokenServiceException("Number of trains does not match")
        if not trains.ok:
            raise BrokenServiceException("Could not get trains")

    def check_conductor_account(self):
        if self.round > 1:
            try:
                self.team_db['Conductor']
            except KeyError:
                self.register('Conductor')
                raise BrokenServiceException("Conductor account not found in db")


app = DerailedChecker.service
if __name__ == "__main__":
    run(DerailedChecker)
