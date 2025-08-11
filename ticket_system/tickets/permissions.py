from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow access if the user is the owner of the ticket or an admin
        print(request.user, obj.user, request.user.is_staff)
        return obj.user == request.user or request.user.is_staff



class CanEditTicketPermission(permissions.BasePermission):
    def has_permission(self,request,view):

        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        return request.user and request.user.is_authenticated


    def has_object_permission(self, request, view, obj):
       
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser or request.user.is_staff:
            return True

   
        return obj.user == request.user and getattr(obj, 'can_edit', False)


