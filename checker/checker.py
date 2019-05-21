import os
import socket
import hmac
import hashlib
import random
import string
import requests
from enochecker import BaseChecker, BrokenServiceException, run


class DerailedChecker(BaseChecker):
    port = 8080

    def __init__(self):
        super().__init__(round=random.randint(0, 50))
        self.address = socket.gethostbyname(socket.gethostname())
        self.host = 'http://' + self.address + ':'

        self.name = 'checker'
        self.pwd = 'secretPassword'
        self.back_port = '8888'
        self.jwt_token = ''
        self.registered = False

    def putflag(self):
        # check connectivity
        try:
            self.test_connection()
            self.http_post("/putflaghere", params={"flag": self.flag})
            self.debug("flag is {}".format(self.flag))

        except BrokenServiceException:
            return BrokenServiceException
        finally:
            self.close()

    def getflag(self):
        if not self.http_get("/getflag") == self.flag:
            raise BrokenServiceException("Oops, wrong flag")

    def putnoise(self):
        with self.connect() as telnet:
            telnet.write(self.noise)

    def getnoise(self):
        with self.connect() as telnet:
            telnet.write("gimmeflag\n")
            telnet.read_expect(self.noise)

    def havoc(self):
        pass

    '''
    ####################
    #  HELPER METHODS  #
    ####################
    '''

    def test_connection(self):
        try:
            s = self.connect(self.address, self.port, 2)
            self.debug("Connected to {}".format(self.address))
        except requests.exceptions.ConnectionError:
            return 'Service Offline'
        return s

    def close(self):
        pass

    def register(self):
        data = {'username': random_username(),
                'password': self.pwd}

        ''' options_headers = {'User-Agent': self.http_useragent_randomize(),
                           "Access-Control-Request-Headers": 'authorization,content-type',
                           "Access-Control-Request-Method": 'POST',
                           "Origin": self.host + str(self.port),
                           "Referer": self.host + str(self.port) + '/'
                           } '''

        post_headers = {'User-Agent': self.http_useragent_randomize()}

        try:
            # o = requests.options(self.host + self.back_port + "/auth/new", headers=options_headers)
            p = requests.post(self.host + self.back_port + "/auth/new", data=data, headers=post_headers)
            r = requests.post(self.host + self.back_port + "/auth", data=data, headers=post_headers)

            if r.ok:
                jwt_token = r.headers['authorization']
                self.jwt_token = jwt_token
        except requests.exceptions.ConnectionError:
            return 'Service Offline'
        self.registered = True

    def generate_flag(self):
        """
        flag = ENO{BASE64} with:
            flag = flagContent (12 bytes) + flagSignature (20 bytes)
            flagContent = roundId (4bytes) + entropy (8bytes)
            flagSignature = hmac(flagContent)
        """
        flag_content = bytes([self.round]) + os.urandom(8)  # round_id + entropy

        rand_key = str(random.randint(0, 99)).encode()
        flag_signature = hmac.new(rand_key, flag_content, hashlib.sha256).hexdigest()

        flag = "ENO" + flag_content.hex() + flag_signature
        self.flag = flag
        return flag


def random_username():
    return ''.join(random.choice(string.ascii_lowercase) for i in range(20))


if __name__ == "__main__":
    # run(DerailedChecker)
    checker = DerailedChecker()
    checker.generate_flag()
    sock = checker.test_connection()
    checker.register()
