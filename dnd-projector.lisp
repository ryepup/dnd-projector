;;; -*- mode: lisp; indent-tabs: nil -*-

(in-package :dnd-projector)


(defun start-server ()
  (hunchentoot:start (make-instance 'hunchentoot:acceptor :port 9081))
  (entry-points))
