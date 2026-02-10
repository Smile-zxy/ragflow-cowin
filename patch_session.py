import os

file_path = "api/apps/sdk/session.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replacement for agent_bot_completions
old_agent_completion = """    token = request.headers.get("Authorization").split()
    if len(token) != 2:
        return get_error_data_result(message='Authorization is not valid!"')
    token = token[1]
    objs = APIToken.query(beta=token)
    if not objs:
        return get_error_data_result(message='Authentication error: API key is invalid!"')

    if req.get("stream", True):
        resp = Response(agent_completion(objs[0].tenant_id, agent_id, **req), mimetype="text/event-stream")"""

new_agent_completion = """    tenant_id = None
    token = request.headers.get("Authorization")
    if token:
        token = token.split()
        if len(token) == 2:
            token = token[1]
            objs = APIToken.query(beta=token)
            if objs:
                tenant_id = objs[0].tenant_id

    if not tenant_id:
        e, cvs = UserCanvasService.get_by_id(agent_id)
        if not e:
            return get_error_data_result(f"Can't find agent by ID: {agent_id}")
        tenant_id = cvs.user_id

    if req.get("stream", True):
        resp = Response(agent_completion(tenant_id, agent_id, **req), mimetype="text/event-stream")"""

content = content.replace(old_agent_completion, new_agent_completion)

# Replace the second usage in agent_bot_completions
content = content.replace("async for answer in agent_completion(objs[0].tenant_id, agent_id, **req):", 
                          "async for answer in agent_completion(tenant_id, agent_id, **req):")

# Replacement for begin_inputs (agent inputs)
# Note: Grep showed lines 968-985.
# The original code:
# @manager.route("/agentbots/<agent_id>/inputs", methods=["GET"])
# async def begin_inputs(agent_id):
#     token = request.headers.get("Authorization").split()
# ...
#     if not objs:
#         return get_error_data_result(message='Authentication error: API key is invalid!"')
# 
#     e, cvs = UserCanvasService.get_by_id(agent_id)

old_begin_inputs = """    token = request.headers.get("Authorization").split()
    if len(token) != 2:
        return get_error_data_result(message='Authorization is not valid!"')
    token = token[1]
    objs = APIToken.query(beta=token)
    if not objs:
        return get_error_data_result(message='Authentication error: API key is invalid!"')

    e, cvs = UserCanvasService.get_by_id(agent_id)"""

new_begin_inputs = """    e, cvs = UserCanvasService.get_by_id(agent_id)
    if not e:
        return get_error_data_result(f"Can't find agent by ID: {agent_id}")

    tenant_id = cvs.user_id
    token = request.headers.get("Authorization")
    if token:
        token = token.split()
        if len(token) == 2:
            token = token[1]
            objs = APIToken.query(beta=token)
            if objs:
                tenant_id = objs[0].tenant_id"""

content = content.replace(old_begin_inputs, new_begin_inputs)

# Replace usage in begin_inputs
content = content.replace("canvas = Canvas(json.dumps(cvs.dsl), objs[0].tenant_id, canvas_id=cvs.id)",
                          "canvas = Canvas(json.dumps(cvs.dsl), tenant_id, canvas_id=cvs.id)")

# Replacement for chatbot_completions and chatbots_inputs
# They share identical auth block
old_chatbot_auth = """    token = request.headers.get("Authorization").split()
    if len(token) != 2:
        return get_error_data_result(message='Authorization is not valid!"')
    token = token[1]
    objs = APIToken.query(beta=token)
    if not objs:
        return get_error_data_result(message='Authentication error: API key is invalid!"')"""

new_chatbot_auth = """    token = request.headers.get("Authorization")
    if token:
        token = token.split()
        if len(token) == 2:
            token = token[1]
            objs = APIToken.query(beta=token)
            if not objs:
                return get_error_data_result(message='Authentication error: API key is invalid!"')"""

# This will replace both occurrences if they are identical
content = content.replace(old_chatbot_auth, new_chatbot_auth)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully patched session.py")
