import os
import socket
import hmac
import hashlib
import random
import jwt
from requests_jwt import JWTAuth
from enochecker import BaseChecker, BrokenServiceException, run


class DerailedChecker(BaseChecker):

    port = 8080

    def __init__(self):
        super().__init__(round=random.randint(0, 50))
        self.address = socket.gethostbyname(socket.gethostname())
        self.host = 'http://'+self.address+':'

        self.name = 'checker'
        self.pwd = 'secretPassword'
        self.registered = False

    def putflag(self):
        # check connectivity
        try:
            self.init_connection()
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

    def init_connection(self):
        try:
            s = self.connect(self.address, self.port, 30)
            self.debug("Connected to {}".format(self.address))
        except ConnectionRefusedError:
            return "Service unreachable"
        except ConnectionError:
            return "Connection failed :("
        return s

    def close(self):
        pass

    def register(self):
        pass

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


if __name__ == "__main__":
    # run(DerailedChecker)
    checker = DerailedChecker()
    checker.generate_flag()
    sock = checker.init_connection()


